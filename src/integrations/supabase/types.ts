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
      agent_runs: {
        Row: {
          agent_type: string
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          input: Json
          output: Json | null
          status: string
        }
        Insert: {
          agent_type: string
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          status?: string
        }
        Update: {
          agent_type?: string
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          status?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_request_log: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: number
          status: number | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: number
          status?: number | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: number
          status?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      authority_signals: {
        Row: {
          backlinks: number | null
          domain: string
          g2_reviews: number | null
          github_stars: number | null
          id: string
          news_mentions: number | null
          reddit_mentions: number | null
          scan_date: string
          stackoverflow_questions: number | null
        }
        Insert: {
          backlinks?: number | null
          domain: string
          g2_reviews?: number | null
          github_stars?: number | null
          id?: string
          news_mentions?: number | null
          reddit_mentions?: number | null
          scan_date?: string
          stackoverflow_questions?: number | null
        }
        Update: {
          backlinks?: number | null
          domain?: string
          g2_reviews?: number | null
          github_stars?: number | null
          id?: string
          news_mentions?: number | null
          reddit_mentions?: number | null
          scan_date?: string
          stackoverflow_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "authority_signals_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["domain"]
          },
        ]
      }
      blog_posts: {
        Row: {
          body: string
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          reading_minutes: number | null
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          reading_minutes?: number | null
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          reading_minutes?: number | null
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          badge_url: string | null
          created_at: string
          domain: string
          expires_at: string | null
          id: string
          issued_at: string | null
          paypal_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_url?: string | null
          created_at?: string
          domain: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          paypal_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_url?: string | null
          created_at?: string
          domain?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          paypal_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["domain"]
          },
        ]
      }
      citation_history: {
        Row: {
          chatgpt_share: number
          claude_share: number
          domain: string
          google_aio_share: number
          id: string
          month: string
          perplexity_share: number
          total_citations: number
          volatility: string
        }
        Insert: {
          chatgpt_share?: number
          claude_share?: number
          domain: string
          google_aio_share?: number
          id?: string
          month: string
          perplexity_share?: number
          total_citations?: number
          volatility?: string
        }
        Update: {
          chatgpt_share?: number
          claude_share?: number
          domain?: string
          google_aio_share?: number
          id?: string
          month?: string
          perplexity_share?: number
          total_citations?: number
          volatility?: string
        }
        Relationships: [
          {
            foreignKeyName: "citation_history_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["domain"]
          },
        ]
      }
      citations: {
        Row: {
          ai_engine: string
          cited_at: string
          cited_url: string | null
          confidence: number | null
          domain: string
          id: string
          position: number | null
          query_category: string | null
          query_text: string | null
        }
        Insert: {
          ai_engine: string
          cited_at?: string
          cited_url?: string | null
          confidence?: number | null
          domain: string
          id?: string
          position?: number | null
          query_category?: string | null
          query_text?: string | null
        }
        Update: {
          ai_engine?: string
          cited_at?: string
          cited_url?: string | null
          confidence?: number | null
          domain?: string
          id?: string
          position?: number | null
          query_category?: string | null
          query_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["domain"]
          },
        ]
      }
      client_integrations: {
        Row: {
          client_id: string
          connection_id: string | null
          created_at: string
          entity_id: string
          id: string
          metadata: Json
          status: string
          toolkit: string
          updated_at: string
        }
        Insert: {
          client_id: string
          connection_id?: string | null
          created_at?: string
          entity_id: string
          id?: string
          metadata?: Json
          status?: string
          toolkit: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          connection_id?: string | null
          created_at?: string
          entity_id?: string
          id?: string
          metadata?: Json
          status?: string
          toolkit?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          created_by: string
          domain: string | null
          id: string
          name: string
          notes: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          domain?: string | null
          id?: string
          name: string
          notes?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          domain?: string | null
          id?: string
          name?: string
          notes?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          category: string
          claimed_by_user_id: string | null
          created_at: string
          description: string | null
          domain: string
          g2_url: string | null
          github_url: string | null
          logo_url: string | null
          name: string
          stackoverflow_tag: string | null
          updated_at: string
        }
        Insert: {
          category: string
          claimed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          domain: string
          g2_url?: string | null
          github_url?: string | null
          logo_url?: string | null
          name: string
          stackoverflow_tag?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          claimed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          domain?: string
          g2_url?: string | null
          github_url?: string | null
          logo_url?: string | null
          name?: string
          stackoverflow_tag?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_scores: {
        Row: {
          authority: number
          canonical: number
          citation_probability: number
          commentary: number
          domain: string
          id: string
          information_gain: number
          overall_ccs: number
          precedent: number
          scan_date: string
          verifiability: number
        }
        Insert: {
          authority?: number
          canonical?: number
          citation_probability?: number
          commentary?: number
          domain: string
          id?: string
          information_gain?: number
          overall_ccs: number
          precedent?: number
          scan_date?: string
          verifiability?: number
        }
        Update: {
          authority?: number
          canonical?: number
          citation_probability?: number
          commentary?: number
          domain?: string
          id?: string
          information_gain?: number
          overall_ccs?: number
          precedent?: number
          scan_date?: string
          verifiability?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_scores_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["domain"]
          },
        ]
      }
      content_analysis: {
        Row: {
          comparison_tables: number | null
          domain: string
          expert_signals: number | null
          factual_density: number | null
          freshness_days: number | null
          id: string
          qa_blocks: number | null
          scan_date: string
          video_count: number | null
        }
        Insert: {
          comparison_tables?: number | null
          domain: string
          expert_signals?: number | null
          factual_density?: number | null
          freshness_days?: number | null
          id?: string
          qa_blocks?: number | null
          scan_date?: string
          video_count?: number | null
        }
        Update: {
          comparison_tables?: number | null
          domain?: string
          expert_signals?: number | null
          factual_density?: number | null
          freshness_days?: number | null
          id?: string
          qa_blocks?: number | null
          scan_date?: string
          video_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analysis_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["domain"]
          },
        ]
      }
      content_briefs: {
        Row: {
          audience: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          id: string
          intent: string | null
          keywords: string[]
          site: string
          status: string
          target_word_count: number | null
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          intent?: string | null
          keywords?: string[]
          site: string
          status?: string
          target_word_count?: number | null
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          intent?: string | null
          keywords?: string[]
          site?: string
          status?: string
          target_word_count?: number | null
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_drafts: {
        Row: {
          aeo_score: number | null
          body_html: string
          brief_id: string | null
          checks: Json
          created_at: string
          created_by: string | null
          geo_score: number | null
          id: string
          overall_score: number | null
          published_at: string | null
          scheduled_for: string | null
          seo_score: number | null
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          aeo_score?: number | null
          body_html?: string
          brief_id?: string | null
          checks?: Json
          created_at?: string
          created_by?: string | null
          geo_score?: number | null
          id?: string
          overall_score?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_score?: number | null
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          aeo_score?: number | null
          body_html?: string
          brief_id?: string | null
          checks?: Json
          created_at?: string
          created_by?: string | null
          geo_score?: number | null
          id?: string
          overall_score?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          seo_score?: number | null
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_drafts_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "content_briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      content_edits: {
        Row: {
          changed_at: string
          changed_by: string | null
          field: string | null
          id: string
          new_value: string | null
          old_value: string | null
          page: string | null
          reason: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          field?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          page?: string | null
          reason?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          field?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          page?: string | null
          reason?: string | null
        }
        Relationships: []
      }
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
      faq_items: {
        Row: {
          active: boolean
          answer: string
          created_at: string
          id: string
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          created_at?: string
          id?: string
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          created_at?: string
          id?: string
          order_index?: number
          question?: string
          updated_at?: string
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
      monitored_sites: {
        Row: {
          alert_email: string | null
          alert_threshold: number
          alert_webhook_url: string | null
          created_at: string
          id: string
          label: string | null
          last_scanned_at: string | null
          last_score: number | null
          paused: boolean
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          alert_email?: string | null
          alert_threshold?: number
          alert_webhook_url?: string | null
          created_at?: string
          id?: string
          label?: string | null
          last_scanned_at?: string | null
          last_score?: number | null
          paused?: boolean
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          alert_email?: string | null
          alert_threshold?: number
          alert_webhook_url?: string | null
          created_at?: string
          id?: string
          label?: string | null
          last_scanned_at?: string | null
          last_score?: number | null
          paused?: boolean
          updated_at?: string
          url?: string
          user_id?: string
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
          display_label: string | null
          display_price: string | null
          features: string[]
          highlight: boolean
          id: string
          image_url: string | null
          name: string
          price_cents: number
          slug: string
          visible_on_homepage: boolean
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          display_label?: string | null
          display_price?: string | null
          features?: string[]
          highlight?: boolean
          id?: string
          image_url?: string | null
          name: string
          price_cents: number
          slug: string
          visible_on_homepage?: boolean
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          display_label?: string | null
          display_price?: string | null
          features?: string[]
          highlight?: boolean
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          slug?: string
          visible_on_homepage?: boolean
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
      reviews: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          preview_url: string
          project_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          preview_url: string
          project_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          preview_url?: string
          project_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scan_quota_usage: {
        Row: {
          period_month: string
          scans_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          period_month: string
          scans_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          period_month?: string
          scans_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          citability: number
          client_id: string | null
          created_by: string | null
          host: string
          id: string
          jsonld: number
          llms: number
          overall: number
          protocol: number | null
          scanned_at: string
          semantic: number
          source: string
          speed: number
          url: string
        }
        Insert: {
          citability: number
          client_id?: string | null
          created_by?: string | null
          host: string
          id?: string
          jsonld: number
          llms: number
          overall: number
          protocol?: number | null
          scanned_at?: string
          semantic: number
          source?: string
          speed: number
          url: string
        }
        Update: {
          citability?: number
          client_id?: string | null
          created_by?: string | null
          host?: string
          id?: string
          jsonld?: number
          llms?: number
          overall?: number
          protocol?: number | null
          scanned_at?: string
          semantic?: number
          source?: string
          speed?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_scans: {
        Row: {
          active: boolean
          cadence: string
          created_at: string
          created_by: string | null
          host: string
          id: string
          last_run_at: string | null
          last_scan_id: string | null
          next_run_at: string
          notes: string | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          cadence: string
          created_at?: string
          created_by?: string | null
          host: string
          id?: string
          last_run_at?: string | null
          last_scan_id?: string | null
          next_run_at?: string
          notes?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          cadence?: string
          created_at?: string
          created_by?: string | null
          host?: string
          id?: string
          last_run_at?: string | null
          last_scan_id?: string | null
          next_run_at?: string
          notes?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          field: string
          id: string
          page: string
          updated_at: string
          value: string
        }
        Insert: {
          field: string
          id?: string
          page: string
          updated_at?: string
          value?: string
        }
        Update: {
          field?: string
          id?: string
          page?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          max_sites: number
          monthly_scan_quota: number
          name: string
          paypal_plan_id: string | null
          price_cents: number
          scan_interval: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id: string
          max_sites: number
          monthly_scan_quota: number
          name: string
          paypal_plan_id?: string | null
          price_cents?: number
          scan_interval: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          max_sites?: number
          monthly_scan_quota?: number
          name?: string
          paypal_plan_id?: string | null
          price_cents?: number
          scan_interval?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          id: string
          paypal_subscription_id: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          paypal_subscription_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          paypal_subscription_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      certifications_public: {
        Row: {
          badge_url: string | null
          created_at: string | null
          domain: string | null
          expires_at: string | null
          id: string | null
          issued_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          badge_url?: string | null
          created_at?: string | null
          domain?: string | null
          expires_at?: string | null
          id?: string | null
          issued_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          badge_url?: string | null
          created_at?: string | null
          domain?: string | null
          expires_at?: string | null
          id?: string | null
          issued_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_domain_fkey"
            columns: ["domain"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["domain"]
          },
        ]
      }
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
