-- Добавление начальных категорий
INSERT INTO categories (name, icon) VALUES 
('Заушные аппараты', 'Ear'),
('Внутриушные аппараты', 'Radio'),
('Аксессуары', 'Cable');

-- Добавление преимуществ
INSERT INTO advantages (icon, title, description) VALUES
('UserCheck', 'Индивидуальный подбор', 'Подбираем аппарат с учетом особенностей слуха, образа жизни и бюджета'),
('Settings', 'Профессиональная настройка', 'Настраиваем аппарат под индивидуальные параметры вашего слуха'),
('Volume2', 'Проверка слуха', 'Проводим тест слуха для точного определения потери слуха'),
('Shield', 'Гарантийное обслуживание', 'Обеспечиваем сервисное обслуживание на весь гарантийный срок'),
('Headphones', 'Поддержка клиентов', 'Отвечаем на вопросы и помогаем в процессе привыкания к аппарату'),
('Sparkles', 'Современные технологии', 'Используем новейшие достижения в области аудиологии');

-- Добавление партнеров
INSERT INTO partners (name, logo_url) VALUES
('Oticon', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Oticon_logo.svg/320px-Oticon_logo.svg.png'),
('Phonak', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Phonak_logo.svg/320px-Phonak_logo.svg.png'),
('Signia', 'https://www.signia-hearing.com/globalassets/signia/shared-components/shared-header/signia_logo.svg'),
('ReSound', 'https://www.resound.com/SiteCollectionImages/ReSound_logo.png'),
('Widex', 'https://www.widex.com/media/images/logo.svg');

-- Добавление главной секции
INSERT INTO hero_section (title, highlighted_text, subtitle, description) VALUES
('ОТКРОЙТЕ ДЛЯ СЕБЯ', 'МИР ЧЕТКОГО ЗВУКА', 'С НАШИМИ РЕШЕНИЯМИ!', 'Инновационные слуховые технологии от мировых лидеров с персональной настройкой и пожизненной поддержкой');
