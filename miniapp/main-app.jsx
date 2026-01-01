import React, { useState, useEffect, useRef } from 'react';

// Theme colors matching Cashew style
const theme = {
  bg: '#0a0a0a',
  card: '#1a1a1a',
  cardHover: '#252525',
  accent: '#c8ff00', // Lime/yellow accent like Cashew
  accentDark: '#a8d900',
  text: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#555555',
  success: '#00d26a',
  danger: '#ff4757',
  gradient: 'linear-gradient(135deg, #c8ff00 0%, #00d26a 100%)'
};

// Mock Data
const mockUser = {
  id: 1,
  name: "Дмитрий",
  username: "@dmitry_utlik",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dmitry",
  status: "Pro Member",
  validUntil: "31.12.2026",
  company: "Utlik.Co & HeadBots",
  role: "CEO",
  city: "Минск",
  bio: "AI-решения для бизнеса. Автоматизация, голосовые агенты, чат-боты.",
  interests: ["AI/ML", "Автоматизация", "Voice AI", "Нетворкинг", "Продажи"],
  telegram: "@dmitry_utlik",
  linkedin: "linkedin.com/in/dmitry",
  lookingFor: "Партнёры для AI-проектов, клиенты на автоматизацию",
  canHelp: "Внедрение AI, разработка ботов, консалтинг",
  eventsAttended: 12,
  connections: 47,
  coffeesMet: 8
};

const mockEvents = [
  { 
    id: 1, 
    title: "AI Agents Workshop", 
    date: "15 янв", 
    time: "19:00",
    location: "HUB 4.0, Минск",
    image: "🤖",
    price: 0,
    spots: 45,
    spotsLeft: 12,
    registered: true,
    type: "workshop"
  },
  { 
    id: 2, 
    title: "Митап: RAG системы", 
    date: "22 янв", 
    time: "18:30",
    location: "Online / Zoom",
    image: "🔧",
    price: 0,
    spots: 100,
    spotsLeft: 34,
    registered: false,
    type: "meetup"
  },
  { 
    id: 3, 
    title: "AI Conf Belarus 2026", 
    date: "15 мар", 
    time: "10:00",
    location: "Prime Hall, Минск",
    image: "🎪",
    price: 150,
    spots: 500,
    spotsLeft: 230,
    registered: false,
    type: "conference"
  },
  { 
    id: 4, 
    title: "Voice AI Хакатон", 
    date: "5 апр", 
    time: "09:00",
    location: "TechMinsk",
    image: "🎙️",
    price: 50,
    spots: 80,
    spotsLeft: 45,
    registered: false,
    type: "hackathon"
  }
];

const mockContent = [
  { id: 1, title: "Введение в AI", count: 12, image: "📚", type: "course", progress: 75 },
  { id: 2, title: "Эфиры с экспертами", count: 8, image: "🎬", type: "streams" },
  { id: 3, title: "Кейсы внедрений", count: 15, image: "💼", type: "cases" },
  { id: 4, title: "Разборы проектов", count: 6, image: "🔍", type: "reviews" },
  { id: 5, title: "Чек-листы и гайды", count: 20, image: "📋", type: "guides" },
  { id: 6, title: "Записи митапов", count: 24, image: "🎥", type: "recordings" }
];

const mockPeople = [
  { 
    id: 1, 
    name: "Алексей Петров", 
    company: "TechStart", 
    role: "CTO",
    city: "Минск",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    bio: "Строю ML-инфраструктуру для стартапов", 
    interests: ["MLOps", "Python", "Cloud"],
    lookingFor: "Инвестиции, партнёры",
    canHelp: "ML архитектура, DevOps"
  },
  { 
    id: 2, 
    name: "Мария Иванова", 
    company: "DataFlow", 
    role: "Data Scientist",
    city: "Гомель",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    bio: "NLP и компьютерное зрение. PhD в процессе", 
    interests: ["NLP", "CV", "Research"],
    lookingFor: "Совместные исследования",
    canHelp: "Датасеты, модели, R&D"
  },
  { 
    id: 3, 
    name: "Игорь Сидоров", 
    company: "AutomateIt", 
    role: "Founder",
    city: "Минск",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=igor",
    bio: "Автоматизация для малого бизнеса", 
    interests: ["RPA", "Chatbots", "Sales"],
    lookingFor: "Клиенты B2B",
    canHelp: "Автоматизация процессов"
  },
  { 
    id: 4, 
    name: "Анна Козлова", 
    company: "FinTech Pro", 
    role: "Product Manager",
    city: "Брест",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anna",
    bio: "AI в финансовых продуктах", 
    interests: ["FinTech", "Product", "AI"],
    lookingFor: "Нетворкинг, обмен опытом",
    canHelp: "Продуктовая стратегия"
  },
  { 
    id: 5, 
    name: "Павел Морозов", 
    company: "VoiceAI Lab", 
    role: "ML Engineer",
    city: "Витебск",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pavel",
    bio: "Голосовые технологии и синтез речи", 
    interests: ["Speech", "ASR", "TTS"],
    lookingFor: "Проекты по Voice AI",
    canHelp: "Голосовые боты, STT/TTS"
  }
];

const mockTickets = [
  { id: 1, event: "AI Agents Workshop", date: "15 янв 2026, 19:00", location: "HUB 4.0", qr: "MAIN-2026-001", status: "active" },
  { id: 2, event: "Новогодний митап", date: "28 дек 2025, 18:00", location: "Imaguru", qr: "MAIN-2025-089", status: "used" }
];

const mockChats = [
  { id: 1, name: "AI/ML общий", members: 847, icon: "🤖" },
  { id: 2, name: "Voice AI", members: 234, icon: "🎙️" },
  { id: 3, name: "No-code/Low-code", members: 312, icon: "⚡" },
  { id: 4, name: "Поиск работы", members: 156, icon: "💼" },
  { id: 5, name: "Флудилка", members: 523, icon: "💬" }
];

const mockCityChats = [
  { id: 1, name: "Минск", members: 634, icon: "🏙️" },
  { id: 2, name: "Гомель", members: 89, icon: "🌆" },
  { id: 3, name: "Брест", members: 67, icon: "🌇" },
  { id: 4, name: "Витебск", members: 45, icon: "🏘️" }
];

// Components

const Avatar = ({ src, size = 50, badge }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: theme.card,
      overflow: 'hidden',
      border: `2px solid ${theme.accent}`
    }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    {badge && (
      <div style={{
        position: 'absolute',
        bottom: -2,
        right: -2,
        background: theme.accent,
        color: theme.bg,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: 8
      }}>
        {badge}
      </div>
    )}
  </div>
);

const Badge = ({ children, variant = 'default' }) => (
  <span style={{
    background: variant === 'accent' ? theme.accent : theme.card,
    color: variant === 'accent' ? theme.bg : theme.text,
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600
  }}>
    {children}
  </span>
);

const Button = ({ children, variant = 'primary', fullWidth, onClick, icon }) => (
  <button
    onClick={onClick}
    style={{
      width: fullWidth ? '100%' : 'auto',
      padding: '14px 24px',
      borderRadius: 14,
      border: variant === 'outline' ? `1px solid ${theme.accent}` : 'none',
      background: variant === 'primary' ? theme.accent : 
                  variant === 'secondary' ? theme.card : 'transparent',
      color: variant === 'primary' ? theme.bg : theme.text,
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'all 0.2s'
    }}
  >
    {icon && <span>{icon}</span>}
    {children}
  </button>
);

const Card = ({ children, onClick, style = {} }) => (
  <div
    onClick={onClick}
    style={{
      background: theme.card,
      borderRadius: 20,
      padding: 16,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      ...style
    }}
  >
    {children}
  </div>
);

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Главная' },
    { id: 'events', icon: '📅', label: 'События' },
    { id: 'network', icon: '🔥', label: 'Нетворк' },
    { id: 'community', icon: '👥', label: 'Комьюнити' },
    { id: 'profile', icon: '👤', label: 'Профиль' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: theme.bg,
      borderTop: `1px solid ${theme.card}`,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 24px 0',
      zIndex: 100
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '4px 12px',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ 
            fontSize: 22,
            filter: activeTab === tab.id ? 'none' : 'grayscale(100%)',
            opacity: activeTab === tab.id ? 1 : 0.5
          }}>
            {tab.icon}
          </span>
          <span style={{ 
            fontSize: 10, 
            fontWeight: 600,
            color: activeTab === tab.id ? theme.accent : theme.textSecondary 
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// ============ SCREENS ============

// HOME SCREEN
const HomeScreen = ({ setActiveTab, setSelectedEvent }) => {
  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header with Profile */}
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={mockUser.avatar} size={50} badge="Pro" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{mockUser.name}</div>
            <div style={{ 
              fontSize: 12, 
              color: theme.accent,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span style={{
                background: theme.accent,
                color: theme.bg,
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700
              }}>
                {mockUser.status}
              </span>
              <span style={{ color: theme.textSecondary }}>до {mockUser.validUntil}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: theme.card,
            border: 'none',
            fontSize: 18,
            cursor: 'pointer'
          }}>🔔</button>
          <button style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: theme.card,
            border: 'none',
            fontSize: 18,
            cursor: 'pointer'
          }}>⚙️</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '0 16px',
        marginBottom: 24
      }}>
        <Card style={{ flex: 1, textAlign: 'center', padding: 14 }} onClick={() => setActiveTab('community')}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>💬</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Чаты</div>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📢</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Канал</div>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center', padding: 14 }} onClick={() => setActiveTab('network')}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>☕</div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Кофе</div>
        </Card>
      </div>

      {/* Content Grid - like Cashew */}
      <div style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>📚 Материалы</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12
        }}>
          {mockContent.map(item => (
            <Card key={item.id} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 100,
                background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.cardHover} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                position: 'relative'
              }}>
                {item.image}
                {item.progress && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: theme.bg
                  }}>
                    <div style={{
                      width: `${item.progress}%`,
                      height: '100%',
                      background: theme.accent
                    }} />
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                <div style={{ 
                  fontSize: 11, 
                  color: theme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{item.count} материалов</span>
                  <span style={{ color: theme.accent }}>→</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Events Preview */}
      <div style={{ padding: '24px 16px 0 16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 12 
        }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>📅 Ближайшие события</h2>
          <button 
            onClick={() => setActiveTab('events')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: theme.accent, 
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Все →
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {mockEvents.slice(0, 3).map(event => (
            <Card 
              key={event.id} 
              onClick={() => { setSelectedEvent(event); setActiveTab('events'); }}
              style={{ 
                minWidth: 200, 
                padding: 14,
                border: event.registered ? `1px solid ${theme.accent}` : 'none'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{event.image}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{event.title}</div>
              <div style={{ fontSize: 11, color: theme.accent, marginBottom: 4 }}>{event.date} • {event.time}</div>
              <div style={{ fontSize: 11, color: theme.textSecondary }}>{event.location}</div>
              {event.registered && (
                <div style={{
                  marginTop: 8,
                  background: theme.accent,
                  color: theme.bg,
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'inline-block'
                }}>
                  ✓ Вы идёте
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Poll */}
      <div style={{ padding: '24px 16px 0 16px' }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>📊 Опрос</h2>
        <Card>
          <p style={{ margin: '0 0 16px 0', fontSize: 14 }}>Какой формат мероприятий вам больше нравится?</p>
          {['Офлайн митапы', 'Онлайн вебинары', 'Гибрид', 'Воркшопы'].map((option, i) => (
            <button key={i} style={{
              width: '100%',
              background: theme.bg,
              border: `1px solid ${theme.card}`,
              borderRadius: 12,
              padding: '12px 14px',
              color: theme.text,
              marginBottom: 8,
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
              transition: 'all 0.2s'
            }}>
              {option}
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
};

// EVENTS SCREEN
const EventsScreen = ({ selectedEvent, setSelectedEvent }) => {
  const [filter, setFilter] = useState('all');
  const [showTicket, setShowTicket] = useState(null);

  if (showTicket) {
    return (
      <div style={{ padding: 16 }}>
        <button 
          onClick={() => setShowTicket(null)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: theme.text, 
            fontSize: 16,
            cursor: 'pointer',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          ← Назад
        </button>
        
        <Card style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
          <h2 style={{ margin: '0 0 8px 0' }}>{showTicket.event}</h2>
          <p style={{ color: theme.textSecondary, margin: '0 0 24px 0' }}>
            {showTicket.date}<br/>{showTicket.location}
          </p>
          
          {/* QR Code */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            margin: '0 auto 16px auto',
            maxWidth: 220
          }}>
            <div style={{
              width: 160,
              height: 160,
              margin: '0 auto',
              background: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px`,
              borderRadius: 8
            }} />
            <div style={{ 
              color: theme.bg, 
              fontWeight: 700, 
              marginTop: 12,
              fontFamily: 'monospace',
              fontSize: 14
            }}>
              {showTicket.qr}
            </div>
          </div>
          
          <p style={{ color: theme.textSecondary, fontSize: 13 }}>
            Покажите QR-код при входе
          </p>
          
          <Button fullWidth variant="secondary" style={{ marginTop: 16 }}>
            📥 Сохранить в Wallet
          </Button>
        </Card>
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <div style={{ paddingBottom: 20 }}>
        <button 
          onClick={() => setSelectedEvent(null)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: theme.text, 
            fontSize: 16,
            cursor: 'pointer',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          ← Назад
        </button>
        
        {/* Event Hero */}
        <div style={{
          height: 180,
          background: `linear-gradient(135deg, ${theme.accent}30 0%, ${theme.card} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 80
        }}>
          {selectedEvent.image}
        </div>
        
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Badge variant="accent">{selectedEvent.type}</Badge>
            {selectedEvent.price === 0 ? (
              <Badge>Бесплатно</Badge>
            ) : (
              <Badge>{selectedEvent.price} BYN</Badge>
            )}
          </div>
          
          <h1 style={{ margin: '0 0 16px 0', fontSize: 24 }}>{selectedEvent.title}</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.date}</div>
                <div style={{ fontSize: 13, color: theme.textSecondary }}>{selectedEvent.time}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.location}</div>
                <div style={{ fontSize: 13, color: theme.textSecondary }}>Показать на карте</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>👥</span>
              <div>
                <div style={{ fontWeight: 600 }}>{selectedEvent.spots - selectedEvent.spotsLeft} участников</div>
                <div style={{ fontSize: 13, color: theme.textSecondary }}>Осталось {selectedEvent.spotsLeft} мест</div>
              </div>
            </div>
          </div>
          
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 14 }}>О мероприятии</h3>
            <p style={{ margin: 0, fontSize: 14, color: theme.textSecondary, lineHeight: 1.6 }}>
              Практический воркшоп по созданию AI-агентов. Разберём архитектуру, инструменты и реальные кейсы. 
              Каждый участник создаст своего агента.
            </p>
          </Card>
          
          {selectedEvent.registered ? (
            <div>
              <Button fullWidth variant="secondary" icon="🎫" onClick={() => setShowTicket(mockTickets[0])}>
                Показать билет
              </Button>
              <button style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: theme.danger,
                padding: 14,
                cursor: 'pointer',
                fontSize: 14
              }}>
                Отменить регистрацию
              </button>
            </div>
          ) : (
            <Button fullWidth icon="🎫">
              {selectedEvent.price === 0 ? 'Зарегистрироваться' : `Купить билет — ${selectedEvent.price} BYN`}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: 16 }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: 24 }}>Мероприятия</h1>
        <p style={{ margin: 0, color: theme.textSecondary, fontSize: 14 }}>Учись, знакомься, развивайся</p>
      </div>
      
      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        padding: '0 16px 16px 16px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'all', label: 'Все' },
          { id: 'registered', label: '🎫 Мои' },
          { id: 'meetup', label: 'Митапы' },
          { id: 'workshop', label: 'Воркшопы' },
          { id: 'conference', label: 'Конференции' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '10px 16px',
              borderRadius: 20,
              border: 'none',
              background: filter === f.id ? theme.accent : theme.card,
              color: filter === f.id ? theme.bg : theme.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* My Tickets */}
      {filter === 'registered' && (
        <div style={{ padding: '0 16px 16px 16px' }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>🎫 Мои билеты</h3>
          {mockTickets.map(ticket => (
            <Card 
              key={ticket.id} 
              onClick={() => setShowTicket(ticket)}
              style={{ 
                marginBottom: 12,
                opacity: ticket.status === 'used' ? 0.6 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{ticket.event}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>{ticket.date}</div>
                </div>
                <Badge variant={ticket.status === 'active' ? 'accent' : 'default'}>
                  {ticket.status === 'active' ? 'Активен' : 'Использован'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Events List */}
      <div style={{ padding: '0 16px' }}>
        {mockEvents
          .filter(e => filter === 'all' || filter === 'registered' || e.type === filter)
          .map(event => (
          <Card 
            key={event.id} 
            onClick={() => setSelectedEvent(event)}
            style={{ 
              marginBottom: 12,
              display: 'flex',
              gap: 14,
              border: event.registered ? `1px solid ${theme.accent}` : 'none'
            }}
          >
            <div style={{
              width: 70,
              height: 70,
              background: theme.bg,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              flexShrink: 0
            }}>
              {event.image}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: 4
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{event.title}</div>
                {event.registered && <span style={{ color: theme.accent }}>✓</span>}
              </div>
              <div style={{ fontSize: 12, color: theme.accent, marginBottom: 4 }}>
                {event.date} • {event.time}
              </div>
              <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 6 }}>
                📍 {event.location}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge>{event.spotsLeft} мест</Badge>
                {event.price === 0 ? (
                  <Badge variant="accent">Free</Badge>
                ) : (
                  <Badge>{event.price} BYN</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// NETWORK SCREEN (Tinder)
const NetworkScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [showProfile, setShowProfile] = useState(null);
  const cardRef = useRef(null);

  const currentPerson = mockPeople[currentIndex % mockPeople.length];

  const handleSwipe = (dir) => {
    setDirection(dir);
    if (dir === 'right') {
      setMatches([...matches, currentPerson]);
    }
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  if (showProfile) {
    return (
      <div style={{ paddingBottom: 20 }}>
        <button 
          onClick={() => setShowProfile(null)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: theme.text, 
            fontSize: 16,
            cursor: 'pointer',
            padding: 16
          }}
        >
          ← Назад
        </button>
        
        <div style={{ padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar src={showProfile.avatar} size={100} />
            <h2 style={{ margin: '16px 0 4px 0' }}>{showProfile.name}</h2>
            <p style={{ margin: 0, color: theme.accent }}>{showProfile.role} @ {showProfile.company}</p>
            <p style={{ margin: '4px 0 0 0', color: theme.textSecondary }}>📍 {showProfile.city}</p>
          </div>
          
          <Card style={{ marginBottom: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: theme.textSecondary }}>О себе</h4>
            <p style={{ margin: 0, fontSize: 14 }}>{showProfile.bio}</p>
          </Card>
          
          <Card style={{ marginBottom: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: theme.textSecondary }}>Интересы</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {showProfile.interests.map((i, idx) => (
                <Badge key={idx}>{i}</Badge>
              ))}
            </div>
          </Card>
          
          <Card style={{ marginBottom: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: theme.textSecondary }}>🔍 Ищу</h4>
            <p style={{ margin: 0, fontSize: 14 }}>{showProfile.lookingFor}</p>
          </Card>
          
          <Card style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: theme.textSecondary }}>💪 Могу помочь</h4>
            <p style={{ margin: 0, fontSize: 14 }}>{showProfile.canHelp}</p>
          </Card>
          
          <Button fullWidth icon="☕">Пригласить на кофе</Button>
        </div>
      </div>
    );
  }

  if (showMatches) {
    return (
      <div style={{ paddingBottom: 20 }}>
        <div style={{ padding: 16 }}>
          <button 
            onClick={() => setShowMatches(false)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: theme.text, 
              fontSize: 16,
              cursor: 'pointer',
              marginBottom: 16
            }}
          >
            ← Назад к свайпам
          </button>
          
          <h2 style={{ margin: '0 0 16px 0' }}>💚 Ваши мэтчи</h2>
          
          {matches.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ color: theme.textSecondary }}>Пока нет мэтчей. Свайпайте вправо!</p>
            </Card>
          ) : (
            matches.map((person, idx) => (
              <Card 
                key={idx} 
                onClick={() => setShowProfile(person)}
                style={{ marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center' }}
              >
                <Avatar src={person.avatar} size={50} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{person.name}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>{person.role} @ {person.company}</div>
                </div>
                <Button variant="secondary" icon="☕" onClick={(e) => { e.stopPropagation(); }}>
                  Кофе
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ 
        padding: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 24 }}>Нетворкинг</h1>
          <p style={{ margin: 0, color: theme.textSecondary, fontSize: 14 }}>Найди полезные контакты</p>
        </div>
        <button 
          onClick={() => setShowMatches(true)}
          style={{
            background: theme.card,
            border: 'none',
            borderRadius: 14,
            padding: '10px 16px',
            color: theme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          💚 <span style={{ fontWeight: 600 }}>{matches.length}</span>
        </button>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        padding: '0 16px 20px 16px' 
      }}>
        <Card style={{ flex: 1, textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: theme.accent }}>{matches.length}</div>
          <div style={{ fontSize: 11, color: theme.textSecondary }}>Мэтчей</div>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: theme.success }}>3</div>
          <div style={{ fontSize: 11, color: theme.textSecondary }}>Встречи</div>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{mockPeople.length - (currentIndex % mockPeople.length)}</div>
          <div style={{ fontSize: 11, color: theme.textSecondary }}>В очереди</div>
        </Card>
      </div>

      {/* Swipe Card */}
      <div style={{ padding: '0 16px' }}>
        <Card 
          ref={cardRef}
          style={{
            padding: 20,
            textAlign: 'center',
            transform: direction === 'left' ? 'translateX(-120%) rotate(-15deg)' : 
                       direction === 'right' ? 'translateX(120%) rotate(15deg)' : 'none',
            opacity: direction ? 0.5 : 1,
            transition: 'all 0.3s ease-out'
          }}
        >
          <Avatar src={currentPerson.avatar} size={100} />
          
          <h2 style={{ margin: '16px 0 4px 0', fontSize: 20 }}>{currentPerson.name}</h2>
          <p style={{ margin: 0, color: theme.accent, fontSize: 14 }}>{currentPerson.role}</p>
          <p style={{ margin: '2px 0 0 0', color: theme.textSecondary, fontSize: 13 }}>{currentPerson.company} • 📍 {currentPerson.city}</p>
          
          <p style={{ 
            margin: '16px 0', 
            fontSize: 14, 
            color: theme.textSecondary,
            fontStyle: 'italic'
          }}>
            "{currentPerson.bio}"
          </p>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 8, 
            justifyContent: 'center',
            marginBottom: 16
          }}>
            {currentPerson.interests.map((interest, i) => (
              <Badge key={i}>{interest}</Badge>
            ))}
          </div>
          
          <Card style={{ background: theme.bg, textAlign: 'left', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>🔍 Ищет</div>
            <div style={{ fontSize: 13 }}>{currentPerson.lookingFor}</div>
          </Card>
          
          <Card style={{ background: theme.bg, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>💪 Может помочь</div>
            <div style={{ fontSize: 13 }}>{currentPerson.canHelp}</div>
          </Card>
        </Card>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginTop: 24
        }}>
          <button
            onClick={() => handleSwipe('left')}
            style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              border: `2px solid ${theme.danger}`,
              background: 'transparent',
              color: theme.danger,
              fontSize: 28,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
          <button
            onClick={() => setShowProfile(currentPerson)}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `1px solid ${theme.card}`,
              background: theme.card,
              color: theme.text,
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            👤
          </button>
          <button
            onClick={() => handleSwipe('right')}
            style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              border: 'none',
              background: theme.success,
              color: theme.bg,
              fontSize: 28,
              cursor: 'pointer'
            }}
          >
            ♥
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          color: theme.textSecondary,
          fontSize: 12,
          marginTop: 16
        }}>
          ← Пропустить • Профиль • Интересен →
        </p>
      </div>
    </div>
  );
};

// COMMUNITY SCREEN
const CommunityScreen = () => {
  const [activeSection, setActiveSection] = useState('chats');

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ padding: 16 }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: 24 }}>Сообщество</h1>
        <p style={{ margin: 0, color: theme.textSecondary, fontSize: 14 }}>1,247 участников</p>
      </div>

      {/* Section Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        padding: '0 16px 16px 16px' 
      }}>
        {[
          { id: 'chats', label: '💬 Чаты' },
          { id: 'cities', label: '🏙️ Города' },
          { id: 'members', label: '👥 Участники' }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '10px 16px',
              borderRadius: 20,
              border: 'none',
              background: activeSection === s.id ? theme.accent : theme.card,
              color: activeSection === s.id ? theme.bg : theme.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {activeSection === 'chats' && (
          <>
            <h3 style={{ fontSize: 14, margin: '0 0 12px 0', color: theme.textSecondary }}>Чаты по темам</h3>
            {mockChats.map(chat => (
              <Card key={chat.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  background: theme.bg,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24
                }}>
                  {chat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{chat.name}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>{chat.members} участников</div>
                </div>
                <span style={{ color: theme.accent }}>→</span>
              </Card>
            ))}
          </>
        )}

        {activeSection === 'cities' && (
          <>
            <h3 style={{ fontSize: 14, margin: '0 0 12px 0', color: theme.textSecondary }}>Чаты по городам</h3>
            {mockCityChats.map(chat => (
              <Card key={chat.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  background: theme.bg,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24
                }}>
                  {chat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{chat.name}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>{chat.members} участников</div>
                </div>
                <span style={{ color: theme.accent }}>→</span>
              </Card>
            ))}
          </>
        )}

        {activeSection === 'members' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <input 
                type="text" 
                placeholder="🔍 Поиск участников..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: theme.card,
                  color: theme.text,
                  fontSize: 14
                }}
              />
            </div>
            {mockPeople.map(person => (
              <Card key={person.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar src={person.avatar} size={50} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{person.name}</div>
                  <div style={{ fontSize: 12, color: theme.accent }}>{person.role}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{person.company} • {person.city}</div>
                </div>
                <span style={{ color: theme.accent }}>→</span>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// PROFILE SCREEN
const ProfileScreen = () => {
  const [editMode, setEditMode] = useState(false);

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent}20 0%, ${theme.bg} 100%)`,
        padding: '24px 16px',
        textAlign: 'center'
      }}>
        <Avatar src={mockUser.avatar} size={90} badge={mockUser.status} />
        <h1 style={{ margin: '16px 0 4px 0', fontSize: 22 }}>{mockUser.name}</h1>
        <p style={{ margin: 0, color: theme.accent, fontSize: 14 }}>{mockUser.role} @ {mockUser.company}</p>
        <p style={{ margin: '4px 0 0 0', color: theme.textSecondary, fontSize: 13 }}>📍 {mockUser.city}</p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          marginTop: 20
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{mockUser.eventsAttended}</div>
            <div style={{ fontSize: 11, color: theme.textSecondary }}>Событий</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{mockUser.connections}</div>
            <div style={{ fontSize: 11, color: theme.textSecondary }}>Контактов</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{mockUser.coffeesMet}</div>
            <div style={{ fontSize: 11, color: theme.textSecondary }}>Встреч</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Edit Button */}
        <Button 
          fullWidth 
          variant="secondary" 
          icon="✏️"
          onClick={() => setEditMode(!editMode)}
        >
          Редактировать профиль
        </Button>

        {/* Bio */}
        <Card style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 13, color: theme.textSecondary }}>О себе</h3>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{mockUser.bio}</p>
        </Card>

        {/* Interests */}
        <Card style={{ marginTop: 12 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 13, color: theme.textSecondary }}>Интересы</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {mockUser.interests.map((interest, i) => (
              <Badge key={i}>{interest}</Badge>
            ))}
          </div>
        </Card>

        {/* Looking For */}
        <Card style={{ marginTop: 12 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 13, color: theme.textSecondary }}>🔍 Ищу</h3>
          <p style={{ margin: 0, fontSize: 14 }}>{mockUser.lookingFor}</p>
        </Card>

        {/* Can Help */}
        <Card style={{ marginTop: 12 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 13, color: theme.textSecondary }}>💪 Могу помочь</h3>
          <p style={{ margin: 0, fontSize: 14 }}>{mockUser.canHelp}</p>
        </Card>

        {/* Contacts */}
        <Card style={{ marginTop: 12 }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 13, color: theme.textSecondary }}>Контакты</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>📱</span>
              <span style={{ fontSize: 14 }}>{mockUser.telegram}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>💼</span>
              <span style={{ fontSize: 14 }}>{mockUser.linkedin}</span>
            </div>
          </div>
        </Card>

        {/* Menu */}
        <Card style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
          {[
            { icon: '🔔', label: 'Уведомления', badge: '3' },
            { icon: '🎫', label: 'Мои билеты' },
            { icon: '💚', label: 'Мои контакты' },
            { icon: '⚙️', label: 'Настройки' },
            { icon: '💬', label: 'Поддержка' }
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: i < 4 ? `1px solid ${theme.bg}` : 'none',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
              {item.badge && (
                <Badge variant="accent">{item.badge}</Badge>
              )}
              <span style={{ color: theme.textSecondary, marginLeft: 8 }}>›</span>
            </div>
          ))}
        </Card>

        {/* Membership */}
        <Card style={{ 
          marginTop: 16, 
          background: `linear-gradient(135deg, ${theme.accent}20 0%, ${theme.card} 100%)`,
          border: `1px solid ${theme.accent}40`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>⭐</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: theme.accent }}>{mockUser.status}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary }}>Активен до {mockUser.validUntil}</div>
            </div>
            <Button variant="outline">Продлить</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// MAIN APP
export default function MAINCommunityApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen setActiveTab={setActiveTab} setSelectedEvent={setSelectedEvent} />;
      case 'events': return <EventsScreen selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />;
      case 'network': return <NetworkScreen />;
      case 'community': return <CommunityScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen setActiveTab={setActiveTab} setSelectedEvent={setSelectedEvent} />;
    }
  };

  return (
    <div style={{
      background: theme.bg,
      color: theme.text,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 90,
      maxWidth: 480,
      margin: '0 auto'
    }}>
      {renderScreen()}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
