
import { defineRelations} from "drizzle-orm/relations";
import * as schema from "./schema" ;

export const relations = defineRelations(
  schema,
  ({ users, products, checkoutSessions, orders, orderItems, one, many }) => ({
    users: {
      orders: many.orders({ from: users.id, to: orders.userId }),
      checkoutSessions: many.checkoutSessions({ from: users.id, to: checkoutSessions.userId }),
    },
    products: {
      orderItems: many.orderItems({ from: products.id, to: orderItems.productId }),
    },
    checkoutSessions: {
      user: one.users({ from: checkoutSessions.userId, to: users.id }),
    },
    orders: {
      user: one.users({ from: orders.userId, to: users.id }),
      items: many.orderItems({ from: orders.id, to: orderItems.orderId }),
    },
    orderItems: {
      order: one.orders({ from: orderItems.orderId, to: orders.id }),
      product: one.products({ from: orderItems.productId, to: products.id }),
    },
  }),
);
