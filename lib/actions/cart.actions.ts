"use server";
import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + taxPrice + shippingPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};
export async function addItemToCart(data: CartItem) {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart session not found");

    // get session and user id
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    const cart = await getMyCart();
    //parse and validate item
    const item = cartItemSchema.parse(data);

    // find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error("Product not found");

    if (!cart) {
      // create new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });
      await prisma.cart.create({
        data: newCart,
      });
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // check if item exists
      const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId);

      if (existItem) {
        //check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }
        //increase the quantity
        (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty = existItem.qty + 1;
      } else {
        if (product.stock < 1) throw new Error("Not enough stock");

        cart.items.push(item);
      }
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} ${existItem ? "Updated in" : "added to"} cart`,
      };
    }
  } catch (error) {
    return {
      success: true,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;

  if (!sessionCartId) throw new Error("Cart session not found");

  // get session and user id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart session not found");

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // check for item
    const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
    if (!exist) throw new Error("Item not found");
    // check if only one in qty
    if (exist.qty === 1) {
      // remove from cart
      cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId);
    } else {
      // decrese qty
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = exist.qty - 1;
    }

    //update in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });
    revalidatePath(`/product/${product.slug}`);
    return {
      success: true,
      message: `${product.name} was removed from cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
