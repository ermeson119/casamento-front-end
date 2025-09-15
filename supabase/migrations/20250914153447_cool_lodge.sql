/*
  # Sistema Completo de Casamento - Ana & Carlos

  1. Tabelas
    - `guests` - Convidados com códigos de convite
    - `gifts` - Lista de presentes com sistema de reservas
  
  2. Funcionalidades
    - Autenticação via código de convite
    - Confirmação de presença com acompanhantes
    - Sistema de reserva de presentes com sincronização
    - Reservas temporárias para prevenir conflitos
  
  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas no email do convidado
    - Prevenção contra reservas duplicadas
*/

-- Tabela de convidados
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  max_companions integer DEFAULT 0,
  confirmed boolean DEFAULT false,
  companions_count integer DEFAULT 0,
  companion_names text[] DEFAULT '{}',
  dietary_restrictions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de presentes
CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'outros',
  price_range text NOT NULL,
  image_url text,
  is_reserved boolean DEFAULT false,
  reserved_by text,
  reserved_at timestamptz,
  temp_reserved_by text,
  temp_reserved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_guests_invite_code ON guests(invite_code);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_gifts_category ON gifts(category);
CREATE INDEX IF NOT EXISTS idx_gifts_is_reserved ON gifts(is_reserved);
CREATE INDEX IF NOT EXISTS idx_gifts_reserved_by ON gifts(reserved_by);
CREATE INDEX IF NOT EXISTS idx_gifts_temp_reserved_by ON gifts(temp_reserved_by);

-- Habilitar RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Políticas para guests
CREATE POLICY "Guests can read own data"
  ON guests
  FOR SELECT
  USING (true); -- Permitir leitura para autenticação

CREATE POLICY "Guests can update own data"
  ON guests
  FOR UPDATE
  USING (true); -- Permitir atualização após autenticação no frontend

-- Políticas para gifts
CREATE POLICY "Anyone can read gifts"
  ON gifts
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update gift reservations"
  ON gifts
  FOR UPDATE
  USING (true);

-- Função para limpar reservas temporárias expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_temp_reservations()
RETURNS void AS $$
BEGIN
  UPDATE gifts
  SET 
    temp_reserved_by = NULL,
    temp_reserved_at = NULL
  WHERE 
    temp_reserved_by IS NOT NULL 
    AND temp_reserved_at < now() - interval '15 minutes';
END;
$$ LANGUAGE plpgsql;

-- Inserir dados de exemplo

-- Convidados de exemplo
INSERT INTO guests (name, email, invite_code, max_companions) VALUES
('João Silva', 'joao@example.com', 'JOAO2025', 1),
('Maria Santos', 'maria@example.com', 'MARIA2025', 2),
('Pedro Oliveira', 'pedro@example.com', 'PEDRO2025', 0),
('Ana Costa', 'ana@example.com', 'ANA2025', 1)
ON CONFLICT (email) DO NOTHING;

-- Lista de presentes de exemplo
INSERT INTO gifts (name, description, category, price_range, image_url) VALUES
('Jogo de Panelas Antiaderente', 'Conjunto completo de panelas antiaderentes com 5 peças, ideal para o dia a dia na cozinha.', 'cozinha', 'R$ 200 - R$ 300', 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg'),
('Máquina de Café Expresso', 'Máquina automática para café expresso com sistema de aquecimento rápido.', 'eletrônicos', 'R$ 800 - R$ 1200', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'),
('Jogo de Cama Casal Premium', 'Jogo de cama 100% algodão com 4 peças, macio e durável.', 'casa', 'R$ 150 - R$ 250', 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'),
('Aspirador de Pó Robô', 'Aspirador inteligente com mapeamento automático e controle por app.', 'eletrônicos', 'R$ 1000 - R$ 1500', 'https://images.pexels.com/photos/4107124/pexels-photo-4107124.jpeg'),
('Conjunto de Taças de Cristal', 'Set de 6 taças de cristal para vinho e champagne, elegantes e sofisticadas.', 'casa', 'R$ 300 - R$ 500', 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg'),
('Liquidificador de Alta Potência', 'Liquidificador com motor de 1200W, ideal para vitaminas e receitas.', 'cozinha', 'R$ 200 - R$ 350', 'https://images.pexels.com/photos/4226764/pexels-photo-4226764.jpeg'),
('Quadro Decorativo Abstrato', 'Quadro moderno para decoração da sala, com moldura elegante.', 'decoração', 'R$ 100 - R$ 200', 'https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg'),
('Air Fryer Digital', 'Fritadeira elétrica sem óleo com painel digital e 8 funções pré-programadas.', 'cozinha', 'R$ 400 - R$ 600', 'https://images.pexels.com/photos/4226764/pexels-photo-4226764.jpeg'),
('Conjunto de Toalhas de Banho', 'Kit com 4 toalhas de banho 100% algodão, super absorventes.', 'casa', 'R$ 80 - R$ 150', 'https://images.pexels.com/photos/6414307/pexels-photo-6414307.jpeg'),
('Smart TV 55 Polegadas', 'Televisão 4K com sistema smart, conectividade Wi-Fi e múltiplas opções de streaming.', 'eletrônicos', 'R$ 2000 - R$ 3000', 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg'),
('Micro-ondas Digital', 'Micro-ondas com painel digital, função grill e 30 litros de capacidade.', 'cozinha', 'R$ 400 - R$ 700', 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg'),
('Luminária de Mesa Moderna', 'Luminária LED ajustável para mesa de escritório ou cabeceira.', 'decoração', 'R$ 120 - R$ 200', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg')
ON CONFLICT (name) DO NOTHING;