export type Operator = 'Grameenphone' | 'Robi' | 'Airtel' | 'Banglalink' | 'Teletalk';
export type RechargeType = 'Regular' | 'Internet' | 'Minute' | 'Bundle';
export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';
export type OrderStatus = 'pending' | 'completed' | 'rejected';

export interface Package {
  id: string;
  operator: Operator;
  type: RechargeType;
  name: string;
  price: number;
  validity: string;
}

export interface Order {
  id: string;
  mobile_number: string;
  operator: Operator;
  package_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string;
  status: OrderStatus;
  created_at: string;
  packages?: Package; // For joined queries
}
