export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          auto_replied_at: string | null
          auto_reply_body: string | null
          auto_reply_subject: string | null
          budget_tier: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          qualification_reasoning: string | null
          qualification_score: number | null
          qualification_suggested_tier: string | null
          qualification_tier: string | null
          source: string
        }
        Insert: {
          auto_replied_at?: string | null
          auto_reply_body?: string | null
          auto_reply_subject?: string | null
          budget_tier: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          qualification_reasoning?: string | null
          qualification_score?: number | null
          qualification_suggested_tier?: string | null
          qualification_tier?: string | null
          source?: string
        }
        Update: {
          auto_replied_at?: string | null
          auto_reply_body?: string | null
          auto_reply_subject?: string | null
          budget_tier?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          qualification_reasoning?: string | null
          qualification_score?: number | null
          qualification_suggested_tier?: string | null
          qualification_tier?: string | null
          source?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          capture_payload: Json | null
          captured_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          items: Json
          paypal_order_id: string | null
          status: string
          subtotal_cents: number
          total_cents: number
        }
        Insert: {
          capture_payload?: Json | null
          captured_at?: string | null
          created_at?: string
          currency: string
          customer_email?: string | null
          id?: string
          items: Json
          paypal_order_id?: string | null
          status?: string
          subtotal_cents: number
          total_cents: number
        }
        Update: {
          capture_payload?: Json | null
          captured_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          items?: Json
          paypal_order_id?: string | null
          status?: string
          subtotal_cents?: number
          total_cents?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          lead_id: string | null
          order_id: string | null
          paid_at: string | null
          status: string
          tier: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          lead_id?: string | null
          order_id?: string | null
          paid_at?: string | null
          status?: string
          tier?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          lead_id?: string | null
          order_id?: string | null
          paid_at?: string | null
          status?: string
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents: number
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          slug?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_email: string | null
          client_name: string | null
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          payment_id: string | null
          start_date: string | null
          status: string
          target_delivery: string | null
          tier: string | null
        }
        Insert: {
          budget?: number | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          payment_id?: string | null
          start_date?: string | null
          status?: string
          target_delivery?: string | null
          tier?: string | null
        }
        Update: {
          budget?: number | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          payment_id?: string | null
          start_date?: string | null
          status?: string
          target_delivery?: string | null
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      report_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          score: number | null
          source: string
          url: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          score?: number | null
          source?: string
          url: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          score?: number | null
          source?: string
          url?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          citability: number
          host: string
          id: string
          jsonld: number
          llms: number
          overall: number
          scanned_at: string
          semantic: number
          source: string
          speed: number
          url: string
        }
        Insert: {
          citability: number
          host: string
          id?: string
          jsonld: number
          llms: number
          overall: number
          scanned_at?: string
          semantic: number
          source?: string
          speed: number
          url: string
        }
        Update: {
          citability?: number
          host?: string
          id?: string
          jsonld?: number
          llms?: number
          overall?: number
          scanned_at?: string
          semantic?: number
          source?: string
          speed?: number
          url?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
