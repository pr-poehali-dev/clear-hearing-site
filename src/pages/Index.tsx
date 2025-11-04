import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
  specs: string;
}

interface Service {
  id: string;
  name: string;
  imageUrl: string;
  contact: string;
  link: string;
}

interface AboutItem {
  id: string;
  title: string;
  description: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
}

interface AppData {
  products: Product[];
  services: Service[];
  about: AboutItem[];
  articles: Article[];
}

const STORAGE_KEY = 'yasny-slukh-data';
const ADMIN_PASSWORD = '3956Qqqq';

const Index = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'home' | 'catalog' | 'services' | 'about' | 'articles'>('home');
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [data, setData] = useState<AppData>({
    products: [],
    services: [],
    about: [],
    articles: []
  });

  const loadData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({
          products: parsed.products || [],
          services: parsed.services || [],
          about: parsed.about || [],
          articles: parsed.articles || []
        });
      } catch (e) {
        console.error('Failed to parse data', e);
      }
    }
  };

  const saveData = (newData: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthed(true);
      setShowAdminDialog(false);
      toast({ title: 'Вход выполнен', description: 'Добро пожаловать в админ-панель' });
    } else {
      toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yasny-slukh-data.json';
    link.click();
    toast({ title: 'Экспорт выполнен', description: 'Данные сохранены в файл' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          saveData(imported);
          toast({ title: 'Импорт выполнен', description: 'Данные загружены' });
        } catch (err) {
          toast({ title: 'Ошибка', description: 'Неверный формат файла', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    }
  };

  const scrollItems = [...data.products, ...data.services];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-primary shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <img src="https://cdn.poehali.dev/files/76bd75c3-4d4d-4b91-a795-2a19bb4fd126.png" alt="Ясный слух" className="h-12 w-12" />
              <h1 className="text-3xl font-black text-foreground tracking-tight">ЯСНЫЙ СЛУХ</h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <button onClick={() => setActiveSection('home')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'home' ? 'text-primary' : 'text-foreground'}`}>ГЛАВНАЯ</button>
              <button onClick={() => setActiveSection('catalog')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'catalog' ? 'text-primary' : 'text-foreground'}`}>КАТАЛОГ</button>
              <button onClick={() => setActiveSection('services')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'services' ? 'text-primary' : 'text-foreground'}`}>УСЛУГИ</button>
              <button onClick={() => setActiveSection('about')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'about' ? 'text-primary' : 'text-foreground'}`}>О КОМПАНИИ</button>
              <button onClick={() => setActiveSection('articles')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'articles' ? 'text-primary' : 'text-foreground'}`}>СТАТЬИ</button>
            </nav>
            <div className="flex gap-2">
              <Button onClick={() => setShowAppointmentDialog(true)} className="bg-primary hover:bg-primary/90 font-bold text-white">
                <Icon name="Calendar" className="mr-2" size={18} />
                ЗАПИСЬ НА ПРИЁМ
              </Button>
              <Button onClick={() => setShowAdminDialog(true)} variant="outline" size="icon" className="border-2">
                <Icon name="Settings" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {scrollItems.length > 0 && (
        <div className="bg-foreground text-white py-3 overflow-hidden">
          <div className="flex whitespace-nowrap animate-scroll">
            {[...scrollItems, ...scrollItems].map((item, index) => (
              <div key={index} className="inline-flex items-center mx-8">
                <span className="text-lg font-bold">
                  {'price' in item ? `${item.name} — ${item.price} ₽` : item.name}
                </span>
                <span className="mx-4 text-primary">●</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
          <div className="space-y-12 section-transition">
            <section className="text-center py-20">
              <h2 className="text-6xl font-black mb-6 text-foreground">ВЕРНЁМ ВАМ МИР ЗВУКОВ</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Современные слуховые аппараты для комфортной жизни. Консультация специалистов и подбор устройств.</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg font-bold px-8" onClick={() => setActiveSection('catalog')}>
                ПОСМОТРЕТЬ КАТАЛОГ
              </Button>
            </section>
          </div>
        )}

        {activeSection === 'catalog' && (
          <div className="section-transition">
            <h2 className="text-5xl font-black mb-8 text-primary title-transition">КАТАЛОГ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.products.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-12">Товары отсутствуют. Добавьте их через админ-панель.</p>
              ) : (
                data.products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:border-primary transition border-2 card-transition">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                    <CardHeader>
                      <CardTitle className="text-2xl font-black">{product.name}</CardTitle>
                      <CardDescription className="text-primary text-xl font-bold">{product.price} ₽</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{product.description}</p>
                      <p className="text-xs text-muted-foreground">{product.specs}</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => setShowAppointmentDialog(true)}>
                        ЗАКАЗАТЬ
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'services' && (
          <div className="section-transition">
            <h2 className="text-5xl font-black mb-8 text-primary title-transition">УСЛУГИ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.services.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-12">Услуги отсутствуют. Добавьте их через админ-панель.</p>
              ) : (
                data.services.map((service) => (
                  <Card key={service.id} className="hover:border-primary transition border-2 card-transition">
                    <img src={service.imageUrl} alt={service.name} className="w-full h-48 object-cover" />
                    <CardHeader>
                      <CardTitle className="text-2xl font-black">{service.name}</CardTitle>
                      <CardDescription>{service.contact}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold" asChild>
                        <a href={service.link} target="_blank" rel="noopener noreferrer">ЗАПИСАТЬСЯ НА ПРИЁМ</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="section-transition">
            <h2 className="text-5xl font-black mb-8 text-primary title-transition">О КОМПАНИИ</h2>
            <div className="space-y-6">
              {data.about.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Информация отсутствует. Добавьте её через админ-панель.</p>
              ) : (
                data.about.map((item) => (
                  <Card key={item.id} className="border-2 card-transition">
                    <CardHeader>
                      <CardTitle className="text-3xl font-black">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'articles' && (
          <div className="section-transition">
            <h2 className="text-5xl font-black mb-8 text-primary title-transition">СТАТЬИ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.articles.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-12">Статьи отсутствуют. Добавьте их через админ-панель.</p>
              ) : (
                data.articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:border-primary transition border-2 card-transition">
                    {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />}
                    <CardHeader>
                      <CardTitle className="text-xl font-black">{article.title}</CardTitle>
                      <CardDescription className="text-xs">{article.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-secondary border-t-4 border-primary mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-black text-primary mb-4">ДОСТАВКА</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="Package" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Самовывоз</p>
                    <p className="text-sm text-muted-foreground">Бесплатно из центра слухопротезирования</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Truck" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Курьер по Москве</p>
                    <p className="text-sm text-muted-foreground">1-2 рабочих дня, 300 ₽</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Почта России</p>
                    <p className="text-sm text-muted-foreground">5-14 рабочих дней, от 350 ₽</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-primary mb-4">ОПЛАТА</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="CreditCard" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Банковской картой</p>
                    <p className="text-sm text-muted-foreground">Visa, MasterCard, МИР</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Banknote" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Наличными</p>
                    <p className="text-sm text-muted-foreground">При получении в центре</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="FileText" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Электронные сертификаты</p>
                    <p className="text-sm text-muted-foreground">ГЭР, СФР</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-primary mb-4">КОНТАКТЫ</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" className="text-primary mt-1" size={20} />
                  <p className="text-sm">ул. Люблинская д. 100 кор. 2, Москва, Россия</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Phone" className="text-primary mt-1" size={20} />
                  <p className="text-sm">+7 (495) 799-09-26</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Mail" className="text-primary mt-1" size={20} />
                  <p className="text-sm">info@yasnyzvuk.ru</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Clock" className="text-primary mt-1" size={20} />
                  <div className="text-sm">
                    <p>пн.-сб.: 10:00-19:00</p>
                    <p>вс.: выходной</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">ЗАПИСЬ НА ПРИЁМ</DialogTitle>
            <DialogDescription>Выберите удобный способ связи</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold" asChild>
              <a href="https://t.me/+79629102391" target="_blank" rel="noopener noreferrer">
                <Icon name="Send" className="mr-2" size={20} />
                Telegram
              </a>
            </Button>
            <Button className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold" asChild>
              <a href="https://wa.me/79629102391" target="_blank" rel="noopener noreferrer">
                <Icon name="MessageCircle" className="mr-2" size={20} />
                WhatsApp
              </a>
            </Button>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold" asChild>
              <a href="tel:+74957990926">
                <Icon name="Phone" className="mr-2" size={20} />
                Позвонить
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">АДМИН-ПАНЕЛЬ</DialogTitle>
          </DialogHeader>
          {!isAdminAuthed ? (
            <div className="space-y-4">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <Button onClick={handleAdminLogin} className="w-full bg-primary hover:bg-primary/90 text-white font-bold">ВОЙТИ</Button>
            </div>
          ) : (
            <AdminPanel data={data} onSave={saveData} onExport={handleExport} onImport={handleImport} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminPanel = ({ data, onSave, onExport, onImport }: {
  data: AppData;
  onSave: (data: AppData) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [activeTab, setActiveTab] = useState('catalog');

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      imageUrl: '',
      price: 0,
      description: '',
      specs: ''
    };
    onSave({ ...data, products: [...data.products, newProduct] });
  };

  const updateProduct = (id: string, field: keyof Product, value: string | number) => {
    const updated = data.products.map(p => p.id === id ? { ...p, [field]: value } : p);
    onSave({ ...data, products: updated });
  };

  const deleteProduct = (id: string) => {
    onSave({ ...data, products: data.products.filter(p => p.id !== id) });
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      imageUrl: '',
      contact: '',
      link: ''
    };
    onSave({ ...data, services: [...data.services, newService] });
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    const updated = data.services.map(s => s.id === id ? { ...s, [field]: value } : s);
    onSave({ ...data, services: updated });
  };

  const deleteService = (id: string) => {
    onSave({ ...data, services: data.services.filter(s => s.id !== id) });
  };

  const addAbout = () => {
    const newAbout: AboutItem = {
      id: Date.now().toString(),
      title: '',
      description: ''
    };
    onSave({ ...data, about: [...data.about, newAbout] });
  };

  const updateAbout = (id: string, field: keyof AboutItem, value: string) => {
    const updated = data.about.map(a => a.id === id ? { ...a, [field]: value } : a);
    onSave({ ...data, about: updated });
  };

  const deleteAbout = (id: string) => {
    onSave({ ...data, about: data.about.filter(a => a.id !== id) });
  };

  const addArticle = () => {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: '',
      content: '',
      imageUrl: '',
      date: new Date().toLocaleDateString('ru-RU')
    };
    onSave({ ...data, articles: [...data.articles, newArticle] });
  };

  const updateArticle = (id: string, field: keyof Article, value: string) => {
    const updated = data.articles.map(a => a.id === id ? { ...a, [field]: value } : a);
    onSave({ ...data, articles: updated });
  };

  const deleteArticle = (id: string) => {
    onSave({ ...data, articles: data.articles.filter(a => a.id !== id) });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="catalog">Каталог</TabsTrigger>
        <TabsTrigger value="services">Услуги</TabsTrigger>
        <TabsTrigger value="about">О компании</TabsTrigger>
        <TabsTrigger value="articles">Статьи</TabsTrigger>
        <TabsTrigger value="data">Данные</TabsTrigger>
      </TabsList>

      <TabsContent value="catalog" className="space-y-4">
        <Button onClick={addProduct} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить товар
        </Button>
        {data.products.map((product) => (
          <Card key={product.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} />
              </div>
              <div>
                <Label>URL картинки</Label>
                <Input value={product.imageUrl} onChange={(e) => updateProduct(product.id, 'imageUrl', e.target.value)} />
              </div>
              <div>
                <Label>Цена</Label>
                <Input type="number" value={product.price} onChange={(e) => updateProduct(product.id, 'price', Number(e.target.value))} />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} />
              </div>
              <div>
                <Label>Характеристики</Label>
                <Textarea value={product.specs} onChange={(e) => updateProduct(product.id, 'specs', e.target.value)} />
              </div>
              <Button variant="destructive" onClick={() => deleteProduct(product.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="services" className="space-y-4">
        <Button onClick={addService} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить услугу
        </Button>
        {data.services.map((service) => (
          <Card key={service.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} />
              </div>
              <div>
                <Label>URL картинки</Label>
                <Input value={service.imageUrl} onChange={(e) => updateService(service.id, 'imageUrl', e.target.value)} />
              </div>
              <div>
                <Label>Контакты</Label>
                <Input value={service.contact} onChange={(e) => updateService(service.id, 'contact', e.target.value)} />
              </div>
              <div>
                <Label>Ссылка</Label>
                <Input value={service.link} onChange={(e) => updateService(service.id, 'link', e.target.value)} />
              </div>
              <Button variant="destructive" onClick={() => deleteService(service.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="about" className="space-y-4">
        <Button onClick={addAbout} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить раздел
        </Button>
        {data.about.map((item) => (
          <Card key={item.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={item.title} onChange={(e) => updateAbout(item.id, 'title', e.target.value)} />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea value={item.description} onChange={(e) => updateAbout(item.id, 'description', e.target.value)} rows={6} />
              </div>
              <Button variant="destructive" onClick={() => deleteAbout(item.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="articles" className="space-y-4">
        <Button onClick={addArticle} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить статью
        </Button>
        {data.articles.map((article) => (
          <Card key={article.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={article.title} onChange={(e) => updateArticle(article.id, 'title', e.target.value)} />
              </div>
              <div>
                <Label>URL картинки (опционально)</Label>
                <Input value={article.imageUrl} onChange={(e) => updateArticle(article.id, 'imageUrl', e.target.value)} />
              </div>
              <div>
                <Label>Дата</Label>
                <Input value={article.date} onChange={(e) => updateArticle(article.id, 'date', e.target.value)} />
              </div>
              <div>
                <Label>Содержание</Label>
                <Textarea value={article.content} onChange={(e) => updateArticle(article.id, 'content', e.target.value)} rows={8} />
              </div>
              <Button variant="destructive" onClick={() => deleteArticle(article.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="data" className="space-y-4">
        <div className="space-y-3">
          <Button onClick={onExport} className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
            <Icon name="Download" className="mr-2" size={16} />
            Экспортировать данные
          </Button>
          <div>
            <Label htmlFor="import-file" className="cursor-pointer">
              <div className="flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 hover:border-primary transition">
                <Icon name="Upload" className="mr-2" size={16} />
                <span className="font-bold">Импортировать данные</span>
              </div>
            </Label>
            <Input id="import-file" type="file" accept=".json" onChange={onImport} className="hidden" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default Index;