export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
          skills: string[] | null
          hourly_rate: number | null
          portfolio_url: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role: string
          skills?: string[] | null
          hourly_rate?: number | null
          portfolio_url?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
          skills?: string[] | null
          hourly_rate?: number | null
          portfolio_url?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          employer_id: string
          title: string
          description: string
          required_skills: string[]
          budget: number
          deadline: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          description: string
          required_skills: string[]
          budget: number
          deadline: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          title?: string
          description?: string
          required_skills?: string[]
          budget?: number
          deadline?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          job_id: string
          freelancer_id: string
          price: number
          proposal: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          freelancer_id: string
          price: number
          proposal: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          freelancer_id?: string
          price?: number
          proposal?: string
          status?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          job_id: string
          employer_id: string
          freelancer_id: string
          amount: number
          progress: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          employer_id: string
          freelancer_id: string
          amount: number
          progress: number
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          employer_id?: string
          freelancer_id?: string
          amount?: number
          progress?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          project_id: string
          sender_id: string
          content: string
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sender_id: string
          content: string
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          sender_id?: string
          content?: string
          file_url?: string | null
          created_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          project_id: string
          description: string
          amount: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          description: string
          amount: number
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          description?: string
          amount?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      disputes: {
        Row: {
          id: string
          project_id: string
          initiator_id: string
          reason: string
          evidence: string
          status: string
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          initiator_id: string
          reason: string
          evidence: string
          status: string
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          initiator_id?: string
          reason?: string
          evidence?: string
          status?: string
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

