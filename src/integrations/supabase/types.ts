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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string
          edited_at: string | null
          edited_by: string
          id: string
          name: string
          price: number
          sku: string
          stock: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          name: string
          price?: number
          sku: string
          stock?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          name?: string
          price?: number
          sku?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          addresses: Json
          created_at: string
          created_by: string
          edited_at: string | null
          edited_by: string
          id: string
          name: string
          notes: string
          owner_user_id: string | null
          phone: string
          primary_index: number
          status: string
        }
        Insert: {
          addresses?: Json
          created_at?: string
          created_by?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          name: string
          notes?: string
          owner_user_id?: string | null
          phone?: string
          primary_index?: number
          status?: string
        }
        Update: {
          addresses?: Json
          created_at?: string
          created_by?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          name?: string
          notes?: string
          owner_user_id?: string | null
          phone?: string
          primary_index?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      combo_items: {
        Row: {
          article_id: string | null
          combo_id: string
          id: string
          quantity: number
        }
        Insert: {
          article_id?: string | null
          combo_id: string
          id?: string
          quantity?: number
        }
        Update: {
          article_id?: string | null
          combo_id?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "combo_items_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "combos"
            referencedColumns: ["id"]
          },
        ]
      }
      combos: {
        Row: {
          created_at: string
          created_by: string
          description: string
          edited_at: string | null
          edited_by: string
          id: string
          influencer_name: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          influencer_name?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          influencer_name?: string
          name?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string
          is_system: boolean
          local_name: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          is_system?: boolean
          local_name: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          is_system?: boolean
          local_name?: string
          name?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          created_at: string
          created_by: string
          delivery_number: string
          edited_at: string | null
          edited_by: string
          expected_date: string | null
          id: string
          note: string
          product_name: string
          quantity: number
          received_date: string | null
          status: string
          supplier_id: string | null
          supplier_name: string
          warehouse_id: string | null
          warehouse_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          delivery_number: string
          edited_at?: string | null
          edited_by?: string
          expected_date?: string | null
          id?: string
          note?: string
          product_name?: string
          quantity?: number
          received_date?: string | null
          status: string
          supplier_id?: string | null
          supplier_name?: string
          warehouse_id?: string | null
          warehouse_name?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          delivery_number?: string
          edited_at?: string | null
          edited_by?: string
          expected_date?: string | null
          id?: string
          note?: string
          product_name?: string
          quantity?: number
          received_date?: string | null
          status?: string
          supplier_id?: string | null
          supplier_name?: string
          warehouse_id?: string | null
          warehouse_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          position: number
          price: number
          quantity: number
          sku: string
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          position?: number
          price?: number
          quantity?: number
          sku: string
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          position?: number
          price?: number
          quantity?: number
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          city: string
          client_id: string | null
          courier: string
          created_at: string
          created_by: string
          customer: string
          delivery_type: string
          edited_at: string | null
          edited_by: string
          id: string
          note: string
          order_number: string
          owner_user_id: string | null
          payment_method: string
          phone: string
          processed_at: string | null
          processed_by: string
          seller_name: string
          shipping: number
          status: string
        }
        Insert: {
          address?: string
          city?: string
          client_id?: string | null
          courier?: string
          created_at?: string
          created_by?: string
          customer: string
          delivery_type?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          note?: string
          order_number: string
          owner_user_id?: string | null
          payment_method?: string
          phone?: string
          processed_at?: string | null
          processed_by?: string
          seller_name?: string
          shipping?: number
          status?: string
        }
        Update: {
          address?: string
          city?: string
          client_id?: string | null
          courier?: string
          created_at?: string
          created_by?: string
          customer?: string
          delivery_type?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          note?: string
          order_number?: string
          owner_user_id?: string | null
          payment_method?: string
          phone?: string
          processed_at?: string | null
          processed_by?: string
          seller_name?: string
          shipping?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          agent_name: string
          amount: number
          client_name: string
          courier: string
          created_at: string
          created_by: string
          edited_at: string | null
          edited_by: string
          id: string
          method: string
          note: string
          order_number: string
          owner_user_id: string | null
          payment_date: string
          payment_number: string
          reference: string
          status: string
        }
        Insert: {
          agent_name?: string
          amount?: number
          client_name?: string
          courier?: string
          created_at?: string
          created_by?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          method?: string
          note?: string
          order_number?: string
          owner_user_id?: string | null
          payment_date?: string
          payment_number: string
          reference?: string
          status: string
        }
        Update: {
          agent_name?: string
          amount?: number
          client_name?: string
          courier?: string
          created_at?: string
          created_by?: string
          edited_at?: string | null
          edited_by?: string
          id?: string
          method?: string
          note?: string
          order_number?: string
          owner_user_id?: string | null
          payment_date?: string
          payment_number?: string
          reference?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          is_system: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string
          email?: string | null
          id: string
          is_system?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          is_system?: boolean
        }
        Relationships: []
      }
      sales: {
        Row: {
          address: string
          city: string
          courier: string
          created_at: string
          created_by: string
          customer: string
          id: string
          owner_user_id: string | null
          phone: string
          price: number
          processed_at: string | null
          processed_by: string
          product_name: string
          quantity: number
          sale_number: string
          seller_name: string
          shipping: number
          status: string
        }
        Insert: {
          address?: string
          city?: string
          courier?: string
          created_at?: string
          created_by?: string
          customer: string
          id?: string
          owner_user_id?: string | null
          phone?: string
          price?: number
          processed_at?: string | null
          processed_by?: string
          product_name?: string
          quantity?: number
          sale_number: string
          seller_name?: string
          shipping?: number
          status?: string
        }
        Update: {
          address?: string
          city?: string
          courier?: string
          created_at?: string
          created_by?: string
          customer?: string
          id?: string
          owner_user_id?: string | null
          phone?: string
          price?: number
          processed_at?: string | null
          processed_by?: string
          product_name?: string
          quantity?: number
          sale_number?: string
          seller_name?: string
          shipping?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          country_code: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          postal_code: string
          region: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name: string
          postal_code?: string
          region?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          postal_code?: string
          region?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      stock: {
        Row: {
          article_id: string
          id: string
          quantity: number
          warehouse_id: string
        }
        Insert: {
          article_id: string
          id?: string
          quantity?: number
          warehouse_id: string
        }
        Update: {
          article_id?: string
          id?: string
          quantity?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          apartment: string
          block: string
          city: string
          contact_email: string
          contact_name: string
          contact_phone: string
          country_code: string | null
          created_at: string
          created_by: string
          description: string
          edited_at: string | null
          edited_by: string
          eik: string
          entrance: string
          floor: string
          iban: string
          id: string
          name: string
          phone: string
          postcode: string
          street: string
          vat: string
        }
        Insert: {
          active?: boolean
          apartment?: string
          block?: string
          city?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          country_code?: string | null
          created_at?: string
          created_by?: string
          description?: string
          edited_at?: string | null
          edited_by?: string
          eik?: string
          entrance?: string
          floor?: string
          iban?: string
          id?: string
          name: string
          phone?: string
          postcode?: string
          street?: string
          vat?: string
        }
        Update: {
          active?: boolean
          apartment?: string
          block?: string
          city?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          country_code?: string | null
          created_at?: string
          created_by?: string
          description?: string
          edited_at?: string | null
          edited_by?: string
          eik?: string
          entrance?: string
          floor?: string
          iban?: string
          id?: string
          name?: string
          phone?: string
          postcode?: string
          street?: string
          vat?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      transfer_items: {
        Row: {
          article_id: string | null
          id: string
          product_name: string
          quantity: number
          transfer_id: string
        }
        Insert: {
          article_id?: string | null
          id?: string
          product_name?: string
          quantity?: number
          transfer_id: string
        }
        Update: {
          article_id?: string | null
          id?: string
          product_name?: string
          quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_items_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          created_at: string
          created_by: string
          description: string
          edited_at: string | null
          edited_by: string
          from_warehouse_id: string | null
          from_warehouse_name: string
          id: string
          status: string
          to_warehouse_id: string | null
          to_warehouse_name: string
          transfer_number: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string
          edited_at?: string | null
          edited_by?: string
          from_warehouse_id?: string | null
          from_warehouse_name?: string
          id?: string
          status: string
          to_warehouse_id?: string | null
          to_warehouse_name?: string
          transfer_number: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          edited_at?: string | null
          edited_by?: string
          from_warehouse_id?: string | null
          from_warehouse_name?: string
          id?: string
          status?: string
          to_warehouse_id?: string | null
          to_warehouse_name?: string
          transfer_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          city: string
          country_code: string | null
          created_at: string
          created_by: string
          id: string
          kind: string
          name: string
          postal_code: string
          street: string
        }
        Insert: {
          city?: string
          country_code?: string | null
          created_at?: string
          created_by?: string
          id?: string
          kind: string
          name: string
          postal_code?: string
          street?: string
        }
        Update: {
          city?: string
          country_code?: string | null
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          name?: string
          postal_code?: string
          street?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "influencer" | "wholesale"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "influencer", "wholesale"],
    },
  },
} as const
