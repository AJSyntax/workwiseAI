-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  reviewer_role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  milestone_id UUID REFERENCES milestones(id),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  amount FLOAT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add evidence_files column to disputes table
ALTER TABLE disputes ADD COLUMN evidence_files TEXT[] DEFAULT '{}';

-- Add read column to messages table
ALTER TABLE messages ADD COLUMN read BOOLEAN DEFAULT false;

-- Add recipient_id column to messages table
ALTER TABLE messages ADD COLUMN recipient_id UUID REFERENCES profiles(id);

-- Create skill_assessments table
CREATE TABLE skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  skill TEXT NOT NULL,
  score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security for new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their own projects" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  auth.uid() IN (
    SELECT employer_id FROM projects WHERE id = project_id
    UNION
    SELECT freelancer_id FROM projects WHERE id = project_id
  )
);

-- Create RLS policies for payments
CREATE POLICY "Users can view payments they're involved in" ON payments FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can create payments they're sending" ON payments FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins can update payment status" ON payments FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Create RLS policies for skill_assessments
CREATE POLICY "Users can view their own skill assessments" ON skill_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skill assessments" ON skill_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Employers can view freelancer skill assessments" ON skill_assessments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'employer'
  )
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER set_timestamp_payments
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

