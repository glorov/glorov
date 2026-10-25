import { z } from "zod";

/**
 * Indian PIN code validation schema:
 * 6 digits, cannot start with 0.
 */
export const indianPincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, {
    message: "Enter a valid 6-digit Indian PIN code (e.g. 411001, 560001)",
  });

/**
 * Indian 10-digit mobile phone number schema:
 * Standard Indian cellular prefixes (6, 7, 8, 9).
 */
export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9][0-9]{9}$/, {
    message: "Enter a valid 10-digit Indian mobile number",
  });

/**
 * Indian Delivery Address Schema
 */
export const indianAddressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address_1: z.string().min(5, "Flat/House No. and Street address are required"),
  address_2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "State/Province is required"),
  postal_code: indianPincodeSchema,
  phone: indianPhoneSchema,
  country_code: z.literal("in").default("in"),
});

export type IndianAddressInput = z.infer<typeof indianAddressSchema>;

/**
 * Botanical Catalog Filter Schema
 */
export const botanicalFilterSchema = z.object({
  category: z.enum(["seeds", "plants", "planters", "care"]).optional(),
  sunlight: z.enum(["full_sun", "partial_shade", "low_light"]).optional(),
  watering: z.enum(["daily", "alternate_days", "weekly", "dry"]).optional(),
  isPerishable: z.boolean().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
});

export type BotanicalFilterInput = z.infer<typeof botanicalFilterSchema>;
