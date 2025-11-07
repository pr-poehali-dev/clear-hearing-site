'''
Business: Manage all website data (services, articles, about, advantages, partners, hero section, orders)
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with statusCode, headers, body
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL environment variable is not set')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        params = event.get('queryStringParameters', {}) or {}
        data_type = params.get('type', '')
        
        if method == 'GET':
            if data_type == 'services':
                cur.execute('SELECT * FROM services ORDER BY created_at DESC')
                items = cur.fetchall()
            elif data_type == 'articles':
                cur.execute('SELECT * FROM articles ORDER BY created_at DESC')
                items = cur.fetchall()
            elif data_type == 'about':
                cur.execute('SELECT * FROM about_items ORDER BY created_at DESC')
                items = cur.fetchall()
            elif data_type == 'advantages':
                cur.execute('SELECT * FROM advantages ORDER BY created_at DESC')
                items = cur.fetchall()
            elif data_type == 'partners':
                cur.execute('SELECT * FROM partners ORDER BY created_at DESC')
                items = cur.fetchall()
            elif data_type == 'hero':
                cur.execute('SELECT * FROM hero_section ORDER BY id DESC LIMIT 1')
                item = cur.fetchone()
                items = item if item else {}
            elif data_type == 'orders':
                cur.execute('SELECT * FROM orders ORDER BY created_at DESC')
                items = cur.fetchall()
            elif data_type == 'all':
                result = {}
                cur.execute('SELECT * FROM services ORDER BY created_at DESC')
                result['services'] = cur.fetchall()
                cur.execute('SELECT * FROM articles ORDER BY created_at DESC')
                result['articles'] = cur.fetchall()
                cur.execute('SELECT * FROM about_items ORDER BY created_at DESC')
                result['about'] = cur.fetchall()
                cur.execute('SELECT * FROM advantages ORDER BY created_at DESC')
                result['advantages'] = cur.fetchall()
                cur.execute('SELECT * FROM partners ORDER BY created_at DESC')
                result['partners'] = cur.fetchall()
                cur.execute('SELECT * FROM hero_section ORDER BY id DESC LIMIT 1')
                hero = cur.fetchone()
                result['hero'] = hero if hero else {}
                cur.execute('SELECT * FROM orders ORDER BY created_at DESC')
                result['orders'] = cur.fetchall()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result, default=str)
                }
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid type parameter'})
                }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(items, default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if data_type == 'services':
                cur.execute(
                    'INSERT INTO services (title, description, price, icon) VALUES (%s, %s, %s, %s) RETURNING *',
                    (body_data.get('title'), body_data.get('description'), body_data.get('price'), body_data.get('icon'))
                )
            elif data_type == 'articles':
                cur.execute(
                    'INSERT INTO articles (title, content, image, date) VALUES (%s, %s, %s, %s) RETURNING *',
                    (body_data.get('title'), body_data.get('content'), body_data.get('image'), body_data.get('date'))
                )
            elif data_type == 'about':
                cur.execute(
                    'INSERT INTO about_items (title, description, icon) VALUES (%s, %s, %s) RETURNING *',
                    (body_data.get('title'), body_data.get('description'), body_data.get('icon'))
                )
            elif data_type == 'advantages':
                cur.execute(
                    'INSERT INTO advantages (title, description, icon) VALUES (%s, %s, %s) RETURNING *',
                    (body_data.get('title'), body_data.get('description'), body_data.get('icon'))
                )
            elif data_type == 'partners':
                cur.execute(
                    'INSERT INTO partners (name, logo) VALUES (%s, %s) RETURNING *',
                    (body_data.get('name'), body_data.get('logo'))
                )
            elif data_type == 'hero':
                cur.execute('DELETE FROM hero_section')
                cur.execute(
                    'INSERT INTO hero_section (title, highlighted_text, subtitle, description) VALUES (%s, %s, %s, %s) RETURNING *',
                    (body_data.get('title'), body_data.get('highlightedText'), body_data.get('subtitle'), body_data.get('description'))
                )
            elif data_type == 'orders':
                cur.execute(
                    'INSERT INTO orders (customer_name, customer_phone, customer_email, items, total_amount, status) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *',
                    (body_data.get('customerName'), body_data.get('customerPhone'), body_data.get('customerEmail'), 
                     json.dumps(body_data.get('items', [])), body_data.get('totalAmount'), body_data.get('status', 'new'))
                )
            elif data_type == 'bulk':
                if 'services' in body_data:
                    cur.execute('DELETE FROM services')
                    for item in body_data['services']:
                        cur.execute(
                            'INSERT INTO services (title, description, price, icon) VALUES (%s, %s, %s, %s)',
                            (item.get('title'), item.get('description'), item.get('price'), item.get('icon'))
                        )
                
                if 'articles' in body_data:
                    cur.execute('DELETE FROM articles')
                    for item in body_data['articles']:
                        cur.execute(
                            'INSERT INTO articles (title, content, image, date) VALUES (%s, %s, %s, %s)',
                            (item.get('title'), item.get('content'), item.get('image'), item.get('date'))
                        )
                
                if 'about' in body_data:
                    cur.execute('DELETE FROM about_items')
                    for item in body_data['about']:
                        cur.execute(
                            'INSERT INTO about_items (title, description, icon) VALUES (%s, %s, %s)',
                            (item.get('title'), item.get('description'), item.get('icon'))
                        )
                
                if 'advantages' in body_data:
                    cur.execute('DELETE FROM advantages')
                    for item in body_data['advantages']:
                        cur.execute(
                            'INSERT INTO advantages (title, description, icon) VALUES (%s, %s, %s)',
                            (item.get('title'), item.get('description'), item.get('icon'))
                        )
                
                if 'partners' in body_data:
                    cur.execute('DELETE FROM partners')
                    for item in body_data['partners']:
                        cur.execute(
                            'INSERT INTO partners (name, logo) VALUES (%s, %s)',
                            (item.get('name'), item.get('logo'))
                        )
                
                if 'hero' in body_data:
                    hero = body_data['hero']
                    cur.execute('DELETE FROM hero_section')
                    cur.execute(
                        'INSERT INTO hero_section (title, highlighted_text, subtitle, description) VALUES (%s, %s, %s, %s)',
                        (hero.get('title'), hero.get('highlightedText'), hero.get('subtitle'), hero.get('description'))
                    )
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Bulk data saved successfully'})
                }
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid type parameter'})
                }
            
            item = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(item, default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            item_id = body_data.get('id')
            
            if not item_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing id'})
                }
            
            if data_type == 'services':
                cur.execute(
                    'UPDATE services SET title=%s, description=%s, price=%s, icon=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *',
                    (body_data.get('title'), body_data.get('description'), body_data.get('price'), body_data.get('icon'), item_id)
                )
            elif data_type == 'articles':
                cur.execute(
                    'UPDATE articles SET title=%s, content=%s, image=%s, date=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *',
                    (body_data.get('title'), body_data.get('content'), body_data.get('image'), body_data.get('date'), item_id)
                )
            elif data_type == 'about':
                cur.execute(
                    'UPDATE about_items SET title=%s, description=%s, icon=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *',
                    (body_data.get('title'), body_data.get('description'), body_data.get('icon'), item_id)
                )
            elif data_type == 'advantages':
                cur.execute(
                    'UPDATE advantages SET title=%s, description=%s, icon=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *',
                    (body_data.get('title'), body_data.get('description'), body_data.get('icon'), item_id)
                )
            elif data_type == 'partners':
                cur.execute(
                    'UPDATE partners SET name=%s, logo=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *',
                    (body_data.get('name'), body_data.get('logo'), item_id)
                )
            elif data_type == 'orders':
                cur.execute(
                    'UPDATE orders SET status=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *',
                    (body_data.get('status'), item_id)
                )
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid type parameter'})
                }
            
            item = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(item, default=str)
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            item_id = body_data.get('id')
            
            if not item_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing id'})
                }
            
            if data_type == 'services':
                cur.execute('DELETE FROM services WHERE id=%s', (item_id,))
            elif data_type == 'articles':
                cur.execute('DELETE FROM articles WHERE id=%s', (item_id,))
            elif data_type == 'about':
                cur.execute('DELETE FROM about_items WHERE id=%s', (item_id,))
            elif data_type == 'advantages':
                cur.execute('DELETE FROM advantages WHERE id=%s', (item_id,))
            elif data_type == 'partners':
                cur.execute('DELETE FROM partners WHERE id=%s', (item_id,))
            elif data_type == 'orders':
                cur.execute('DELETE FROM orders WHERE id=%s', (item_id,))
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid type parameter'})
                }
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Deleted successfully'})
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
