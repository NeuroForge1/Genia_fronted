-- Migración para feature flags y conectores
-- Ejecutar en el entorno de producción

-- Tabla para feature flags de usuarios
CREATE TABLE IF NOT EXISTS user_feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, flag_name)
);

-- Tabla para feature flags de grupos beta
CREATE TABLE IF NOT EXISTS beta_group_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_name TEXT NOT NULL,
  flag_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_name, flag_name)
);

-- Añadir campo beta_group a la tabla de perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beta_group TEXT;

-- Tabla para credenciales de redes sociales
CREATE TABLE IF NOT EXISTS social_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT,
  page_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Tabla para credenciales de email marketing
CREATE TABLE IF NOT EXISTS email_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  api_key TEXT NOT NULL,
  server_prefix TEXT,
  platform_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Tabla para tareas ejecutadas
CREATE TABLE IF NOT EXISTS executed_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_feature_flags_user_id ON user_feature_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_social_credentials_user_id ON social_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_email_credentials_user_id ON email_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_executed_tasks_user_id ON executed_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_executed_tasks_status ON executed_tasks(status);
CREATE INDEX IF NOT EXISTS idx_executed_tasks_task_type ON executed_tasks(task_type);

-- Políticas RLS para seguridad
-- Políticas para user_feature_flags
ALTER TABLE user_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feature flags"
  ON user_feature_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature flags"
  ON user_feature_flags FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para social_credentials
ALTER TABLE social_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own social credentials"
  ON social_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social credentials"
  ON social_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social credentials"
  ON social_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social credentials"
  ON social_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para email_credentials
ALTER TABLE email_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email credentials"
  ON email_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email credentials"
  ON email_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email credentials"
  ON email_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email credentials"
  ON email_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para executed_tasks
ALTER TABLE executed_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own executed tasks"
  ON executed_tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Función para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_user_feature_flags_updated_at
  BEFORE UPDATE ON user_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beta_group_flags_updated_at
  BEFORE UPDATE ON beta_group_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_credentials_updated_at
  BEFORE UPDATE ON social_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_credentials_updated_at
  BEFORE UPDATE ON email_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executed_tasks_updated_at
  BEFORE UPDATE ON executed_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar completed_at cuando el estado cambia a 'completed'
CREATE OR REPLACE FUNCTION update_completed_at_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar completed_at
CREATE TRIGGER update_executed_tasks_completed_at
  BEFORE UPDATE ON executed_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_at_column();
