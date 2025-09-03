import { DataTable } from "@/components/data-table/data-table"
import { columns } from "@/components/data-table/columns"

// Example data - in a real app, you would fetch this from an API
const data = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
    paymentMethod: "Credit Card",
    createdAt: new Date("2023-01-03"),
    category: "Subscription",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
    paymentMethod: "PayPal",
    createdAt: new Date("2023-02-14"),
    category: "One-time",
  },
  {
    id: "6a53c8dc",
    amount: 200,
    status: "success",
    email: "user@domain.com",
    paymentMethod: "Bank Transfer",
    createdAt: new Date("2023-03-22"),
    category: "Subscription",
  },
  {
    id: "9f49b2c5",
    amount: 50,
    status: "failed",
    email: "test@example.com",
    paymentMethod: "Credit Card",
    createdAt: new Date("2023-04-05"),
    category: "One-time",
  },
  {
    id: "5e8b7a1d",
    amount: 175,
    status: "success",
    email: "customer@mail.com",
    paymentMethod: "PayPal",
    createdAt: new Date("2023-05-18"),
    category: "Subscription",
  },
  {
    id: "3c6d9f2e",
    amount: 300,
    status: "pending",
    email: "client@business.com",
    paymentMethod: "Bank Transfer",
    createdAt: new Date("2023-06-27"),
    category: "One-time",
  },
  {
    id: "7b4a8e2f",
    amount: 225,
    status: "processing",
    email: "contact@domain.org",
    paymentMethod: "Credit Card",
    createdAt: new Date("2023-07-10"),
    category: "Subscription",
  },
  {
    id: "2d5e9c7b",
    amount: 150,
    status: "success",
    email: "person@example.net",
    paymentMethod: "PayPal",
    createdAt: new Date("2023-08-15"),
    category: "One-time",
  },
]

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Advanced Data Table</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
