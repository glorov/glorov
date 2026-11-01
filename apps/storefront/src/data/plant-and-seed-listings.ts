/**
 * Authentic Plant & Seed Listings Extracted from Ugaoo.com
 * Domain Constraint: Living Plants and Pure Seeds ONLY (0 tools, 0 harvesters, 0 pots/planters)
 * Generated via scripts/extract-ugaoo-assets-and-styles.mjs
 */

export interface BotanicalListingItem {
  id: string
  handle: string
  title: string
  category: 'plants' | 'seeds'
  subCategory: string
  price: number
  compareAtPrice: number | null
  discountPercent: number
  currency: 'INR'
  rating: number
  reviewCount: number
  inStock: boolean
  thumbnail: string
  images: string[]
  descriptionHtml: string
  tags: string[]
  variants: {
    id: string
    title: string
    price: number
    compareAtPrice: number | null
    available: boolean
    sku: string
  }[]
}

export const PLANT_AND_SEED_LISTINGS: BotanicalListingItem[] = [
  {
    "id": "6941052764292",
    "handle": "peace-lily-plant",
    "title": "Peace Lily Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 249,
    "compareAtPrice": 249,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 70,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-292_1_76e34228-5ca7-48ea-b42c-512bb6c3bbd1.jpg?v=1786528267",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-292_1_76e34228-5ca7-48ea-b42c-512bb6c3bbd1.jpg?v=1786528267",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_551dde3e-486b-463f-a1e5-52562add2c38.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-04_1.jpg?v=1788594679",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_712bfc7a-5cbd-4f4e-ab24-c439332d3faf.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_aaeb3ad4-da85-41a3-9d4b-52cf3768a328.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_20292bd6-7c80-42e2-ad60-a8a0f75fc590.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_f6227323-1a40-4d71-b8a0-dff8108ade8d.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_4a3df704-2b85-439f-9c70-2d85b911640c.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_9b0ef299-786e-4deb-98f2-3252c0bad1de.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_00246965-0096-44a7-94f1-5769ced850fa.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c84a4faa-9b87-481b-bded-fd2e906344fb.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PDM1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PRCB1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PRM1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PRP1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PGCB1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PGM1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PGP1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/PGW1.jpg?v=1774857428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-293.jpg?v=1785506754",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-294.jpg?v=1785506634",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-296.jpg?v=1785506852",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-298.jpg?v=1785506695",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-299.jpg?v=1785506817",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-300.jpg?v=1785506653",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-301.jpg?v=1785506905",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-302.jpg?v=1785506712",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-303.jpg?v=1785506788",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-310.jpg?v=1785506862",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-311.jpg?v=1785506725",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-312.jpg?v=1785506921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-314.jpg?v=1785506891",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-315.jpg?v=1785506773",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-316.jpg?v=1785506741",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-317.jpg?v=1785506622",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_2.jpg?v=1785931439",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_4.jpg?v=1785931532",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_3.jpg?v=1785931472",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_5.jpg?v=1785931547",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_6.jpg?v=1785931457",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_7.jpg?v=1785931520",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_8.jpg?v=1785931499",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_9.jpg?v=1785931484",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_10_1.jpg?v=1785931583",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_11.jpg?v=1785931565",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-308_964e5bf7-ff66-4264-bf4a-7b22f19f55ec.jpg?v=1785938232",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-305_b08da1f9-26c6-4661-a781-8c3a0258b078.jpg?v=1785938245",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-307_2e0a0c03-2ed4-408a-8229-ad03d01b2fa2.jpg?v=1785938259",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Peace_Lily-02.jpg?v=1786514020",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Grail_Ceramic_Pot-Peach.jpg?v=1786542807",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Krish_12_Planter-Ivory.jpg?v=1786542821",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_03_01_52_PM.jpg?v=1788350610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_07_59_25_PM.jpg?v=1788350637",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_08_55_36_PM.jpg?v=1788350622",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Peace_Lily-05.jpg?v=1786514054",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Peace_Lily-03_a98fe801-0976-4437-9782-f41cfff59f4d.jpg?v=1786514007",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Peace_Lily-04_76e1cd8f-1e4e-4a02-85b6-1bf8793b14a1.jpg?v=1786514034",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Peace_Lily-01.jpg?v=1786513993",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-056.jpg?v=1788350038",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-062.jpg?v=1788350232",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-070.jpg?v=1788350130",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-072.jpg?v=1788350023",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-073.jpg?v=1788350066",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-076.jpg?v=1788350306",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-081.jpg?v=1788350007",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-087.jpg?v=1788350081",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-088.jpg?v=1788350116",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-095.jpg?v=1788350248",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-097.jpg?v=1788350203",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-098.jpg?v=1788350352",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-099.jpg?v=1788350180",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-102.jpg?v=1788350056",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-103.jpg?v=1788349975",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-104.jpg?v=1788350320",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-105.jpg?v=1788350094",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-106.jpg?v=1788350335",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-107.jpg?v=1788350219",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-054.jpg?v=1788350011",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_2_b12e5e5f-80da-433e-8962-e68f36990763.jpg?v=1788350517",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Peace_Lily_Artboard_4_db0d8738-50e2-4096-b00f-430222284e27.jpg?v=1788348859",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_9_54799bcc-1cfa-4b7c-951c-a46ecdbac9e0.jpg?v=1788350668",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_3_b0b3edef-5b6a-4763-9cd9-c0ca6e1533ca.jpg?v=1788350965",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_4_054e6ddc-1426-430b-8d6f-3b6fd6602c03.jpg?v=1788350547",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_5_f399d38d-4c79-48ab-b34e-601e2c0df32f.jpg?v=1788350652",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_6_e9ec8d56-bb26-4ca2-8fc3-68f895e23850.jpg?v=1788350562",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_7_e7cfa304-20d1-44b6-bd28-45d262173934.jpg?v=1788350577",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_8_b61b280c-aa8a-40bc-88c0-73a62f339d4c.jpg?v=1788350979",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peace_Lily_Artboard_10_100d7c5d-ddd7-4a45-aea2-2e532ddee9f6.jpg?v=1788350596"
    ],
    "descriptionHtml": "<p dir=\"ltr\"><span>The </span><span>Peace Lily plant</span><span> is a stunning indoor flowering plant with dark, glossy green leaves and occasional pearly white flowers that put any competitors to shame. Known to be one of the best air-purifying plants, the </span><span>Peace Lily</span><span> is a wonderful indoor companion with a fuss-free attitude and low maintenance requirements. It is also fairly fast-growing, making it the perfect lush plant for indoor displays. </span></p>",
    "tags": [
      "air-purifying",
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "featured",
      "flash",
      "flowering-plants",
      "low-light",
      "Peace Lily Plant",
      "Plants",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41370818412676",
        "title": "Small / GroPot / Mocca",
        "price": 249,
        "compareAtPrice": 249,
        "available": true,
        "sku": "NUPL0032"
      },
      {
        "id": "41370817167492",
        "title": "Small / Krish / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032KIY"
      },
      {
        "id": "40859446476932",
        "title": "Small / Krish / White",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032KWT"
      },
      {
        "id": "41370817265796",
        "title": "Small / Krish / Brown",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032KBN"
      },
      {
        "id": "51199181717636",
        "title": "Small / Kyoto / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032QMC"
      },
      {
        "id": "51199181684868",
        "title": "Small / Kyoto / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032QIY"
      },
      {
        "id": "51199181750404",
        "title": "Small / Kyoto / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032QTC"
      },
      {
        "id": "51846476529796",
        "title": "Small / Yoda / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032YMC"
      },
      {
        "id": "51846476562564",
        "title": "Small / Yoda / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032YIY"
      },
      {
        "id": "51846476595332",
        "title": "Small / Yoda / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0032YTC"
      },
      {
        "id": "41372122939524",
        "title": "Small / Lagos / Mocca",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0032LMC"
      },
      {
        "id": "41372122972292",
        "title": "Small / Lagos / White",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0032LWT"
      },
      {
        "id": "41372123103364",
        "title": "Small / Lagos / Grey",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0032LGY"
      },
      {
        "id": "41709645824132",
        "title": "Small / Roma / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032RWT"
      },
      {
        "id": "41709645856900",
        "title": "Small / Roma / Grey",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0032RGR"
      },
      {
        "id": "51178613473412",
        "title": "Small / Roma / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032RCB"
      },
      {
        "id": "51178613407876",
        "title": "Small / Roma / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032RPC"
      },
      {
        "id": "51178613440644",
        "title": "Small / Roma / Megenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032RMJ"
      },
      {
        "id": "41622324314244",
        "title": "Small / Diamond / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0032DWT"
      },
      {
        "id": "41709646053508",
        "title": "Small / Diamond / Magenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032DMJ"
      },
      {
        "id": "41709646020740",
        "title": "Small / Diamond / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032DCB"
      },
      {
        "id": "41709645987972",
        "title": "Small / Diamond / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032DPC"
      },
      {
        "id": "51846476628100",
        "title": "Small / Table Top / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0032TWT"
      },
      {
        "id": "41709645889668",
        "title": "Small / Jar / Eggshell White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL3268"
      },
      {
        "id": "41709645922436",
        "title": "Small / Jar / Dusty Rose",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL3269"
      },
      {
        "id": "41709645955204",
        "title": "Small / Jar / Cloud Grey",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL3270"
      },
      {
        "id": "41370816217220",
        "title": "Small / Spiro / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032SWT"
      },
      {
        "id": "41370817298564",
        "title": "Small / Spiro / Pink",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0032SPK"
      },
      {
        "id": "41370817331332",
        "title": "Small / Spiro / Black",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032SBK"
      },
      {
        "id": "41370817364100",
        "title": "Small / Spiro / Turquoise Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0032STQ"
      },
      {
        "id": "41370817396868",
        "title": "Small / Spiro / Cadet Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0032SCB"
      },
      {
        "id": "41370818609284",
        "title": "Small / Spiro / Sky Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0032SSB"
      },
      {
        "id": "51178615373956",
        "title": "Small / Grail / White",
        "price": 420,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0032GWT"
      },
      {
        "id": "51178615406724",
        "title": "Small / Grail / Magenta",
        "price": 420,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0032GMJ"
      },
      {
        "id": "51178615439492",
        "title": "Small / Grail / Carton Brown",
        "price": 420,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0032GCB"
      },
      {
        "id": "51178615472260",
        "title": "Small / Grail / Peach",
        "price": 420,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0032GPC"
      },
      {
        "id": "41370818576516",
        "title": "Medium / GroPot / Mocca",
        "price": 499,
        "compareAtPrice": 499,
        "available": true,
        "sku": "NUPL0475"
      },
      {
        "id": "41370817691780",
        "title": "Medium / Krish / Ivory",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0475KIY"
      },
      {
        "id": "52760290721924",
        "title": "Medium / Krish / Yellow",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0475KYL"
      },
      {
        "id": "52761023873156",
        "title": "Medium / Krish / White",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0475KWT"
      },
      {
        "id": "41370817790084",
        "title": "Medium / Krish / Brown",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0475KBN"
      },
      {
        "id": "41370817822852",
        "title": "Medium / Grail / Peach",
        "price": 999,
        "compareAtPrice": 1050,
        "available": false,
        "sku": "NUPL0475GPC"
      },
      {
        "id": "52761011191940",
        "title": "Medium / Grail / White",
        "price": 999,
        "compareAtPrice": 1050,
        "available": false,
        "sku": "NUPL0475GWT"
      },
      {
        "id": "52761012142212",
        "title": "Medium / Diamond / White",
        "price": 799,
        "compareAtPrice": 1050,
        "available": false,
        "sku": "NUPL0475DWT"
      },
      {
        "id": "41622324281476",
        "title": "Medium / Aurelius / White",
        "price": 1199,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0475AWG"
      },
      {
        "id": "41622324248708",
        "title": "Medium / Aurelius / Grey",
        "price": 1199,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0475AGG"
      },
      {
        "id": "41622324347012",
        "title": "Medium / Prism / White",
        "price": 1199,
        "compareAtPrice": 1200,
        "available": true,
        "sku": "NUPL0475PWG"
      },
      {
        "id": "52759991648388",
        "title": "Medium / York / White",
        "price": 599,
        "compareAtPrice": 1200,
        "available": true,
        "sku": "NUPL0475YRW"
      },
      {
        "id": "52759991746692",
        "title": "Medium / York / Mocaa",
        "price": 599,
        "compareAtPrice": 1200,
        "available": true,
        "sku": "NUPL0475YRM"
      },
      {
        "id": "52759991976068",
        "title": "Medium / York / Terracotta",
        "price": 599,
        "compareAtPrice": 1200,
        "available": true,
        "sku": "NUPL0475YRT"
      },
      {
        "id": "52759995220100",
        "title": "Medium / Roma / White",
        "price": 899,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0475RWT"
      },
      {
        "id": "52759995252868",
        "title": "Medium / Roma / Grey",
        "price": 899,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0475RGY"
      },
      {
        "id": "52759995285636",
        "title": "Medium / Frosted / White",
        "price": 999,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0475FWT"
      },
      {
        "id": "52759995744388",
        "title": "Medium / Frosted / Dusty Rose",
        "price": 999,
        "compareAtPrice": 1200,
        "available": true,
        "sku": "NUPL0475FDR"
      },
      {
        "id": "52760056103044",
        "title": "Medium / Prism / Cream",
        "price": 1199,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0475PGG"
      },
      {
        "id": "52761010765956",
        "title": "Medium / Prism / Dark Green",
        "price": 1199,
        "compareAtPrice": 1200,
        "available": true,
        "sku": "NUPL0475PMG"
      },
      {
        "id": "52760002756740",
        "title": "Medium / Aurelius / Dark Green",
        "price": 1199,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0475AMG"
      }
    ]
  },
  {
    "id": "6941093036164",
    "handle": "anthurium-red-plant",
    "title": "Anthurium Red Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 599,
    "compareAtPrice": 599,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 94,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-299.jpg?v=1788242336",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-299.jpg?v=1788242336",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-302.jpg?v=1788242351",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-301.jpg?v=1788242334",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-305.jpg?v=1788242366",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-308.jpg?v=1788242394",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-312.jpg?v=1788242413",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-310.jpg?v=1788242430",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-316.jpg?v=1788242442",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-319.jpg?v=1788242454",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-318.jpg?v=1788242473",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-325.jpg?v=1788242488",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-326.jpg?v=1788242501",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-313.jpg?v=1788242515",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-314.jpg?v=1788242533",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-315.jpg?v=1788242549",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-320.jpg?v=1788242575",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-323.jpg?v=1788242594",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-327.jpg?v=1788242610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-328.jpg?v=1788242623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-329.jpg?v=1788242638",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_2.jpg?v=1788277967",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_3.jpg?v=1788277983",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_4.jpg?v=1788278004",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_5.jpg?v=1788278012",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_6.jpg?v=1788278026",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_7.jpg?v=1788278043",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_8.jpg?v=1788278058",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_9.jpg?v=1788278077",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_10_1.jpg?v=1788278093",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Anthurium_Red_Artboard_11.jpg?v=1788278121",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-254.jpg?v=1792231124",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-256.jpg?v=1792231159",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-257.jpg?v=1792231096",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-258.jpg?v=1792231110",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_2.jpg?v=1792231033",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_3.jpg?v=1792230977",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_4.jpg?v=1792230991",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_5.jpg?v=1792231018",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_6.jpg?v=1792231004",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_7.jpg?v=1792231136",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_8.jpg?v=1792231076",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_9.jpg?v=1792231048",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Anthurium_Red_10.jpg?v=1792231061"
    ],
    "descriptionHtml": "This plant looks great when planted indoors. It features large, leathery, arrow-shaped green leaves. Its unusual, large, heart-shaped, showy red flowers bloom indoors. It is high on maintenance can be planted in decorative pots in the living room.",
    "tags": [
      "Birthday",
      "Birthday_plants",
      "flash",
      "flowering-plants",
      "limited-stock",
      "Long-lasting",
      "Long-Living",
      "low-maintenance",
      "retail-store",
      "score:100",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "40859521187972",
        "title": "Medium / GroPot / Mocca",
        "price": 599,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0108"
      },
      {
        "id": "41599908806788",
        "title": "Medium / Krish / Ivory",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0108KIY"
      },
      {
        "id": "41599908774020",
        "title": "Medium / Krish / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0108KWT"
      },
      {
        "id": "41599908839556",
        "title": "Medium / Krish / Red",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0108KRD"
      },
      {
        "id": "52747604394116",
        "title": "Medium / York / Mocca",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0108YRM"
      },
      {
        "id": "52747593285764",
        "title": "Medium / York / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0108YRW"
      },
      {
        "id": "52747606786180",
        "title": "Medium / York / Terracotta",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0108YRT"
      },
      {
        "id": "41599909232772",
        "title": "Medium / Grail / White",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0108GWT"
      },
      {
        "id": "41599909200004",
        "title": "Medium / Grail / Peach",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0108GPC"
      },
      {
        "id": "41599909068932",
        "title": "Medium / Aurelius / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0108AWG"
      },
      {
        "id": "41599909101700",
        "title": "Medium / Aurelius / Grey",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0108AGG"
      },
      {
        "id": "52747641946244",
        "title": "Medium / Aurelius / Dark Green",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0108AMG"
      },
      {
        "id": "41599909134468",
        "title": "Medium / Prism / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0108PWG"
      },
      {
        "id": "52747646304388",
        "title": "Medium / Prism / Dark Green",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0108PMG"
      },
      {
        "id": "52747650138244",
        "title": "Medium / Prism / Cream",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0108PIG"
      },
      {
        "id": "52747656364164",
        "title": "Medium / Roma / White",
        "price": 999,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0108RWT"
      },
      {
        "id": "52747660525700",
        "title": "Medium / Roma / Grey",
        "price": 999,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0108RGY"
      },
      {
        "id": "52747664949380",
        "title": "Medium / Frosted / White",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0108FWT"
      },
      {
        "id": "52747670683780",
        "title": "Medium / Frosted / Dusty rose",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": true,
        "sku": "NUPL0108FDR"
      },
      {
        "id": "52747683070084",
        "title": "Medium / Diamond / White",
        "price": 899,
        "compareAtPrice": 1000,
        "available": false,
        "sku": "NUPL0108DWT"
      },
      {
        "id": "41163005034628",
        "title": "Large / Krish / Ivory",
        "price": 1499,
        "compareAtPrice": 1499,
        "available": false,
        "sku": "NUPL0629KIY"
      }
    ]
  },
  {
    "id": "6941123051652",
    "handle": "jade-plant-mini",
    "title": "Jade Mini Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 199,
    "compareAtPrice": 199,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 191,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c9aaa3ce-c3d3-45f5-b3a9-6ef48498b3e2.jpg?v=1770026404",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c9aaa3ce-c3d3-45f5-b3a9-6ef48498b3e2.jpg?v=1770026404",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-04.jpg?v=1788508484",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_b4df6912-93da-4dd0-97a4-d4e2713c9166.jpg?v=1770026404",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c623ee33-b867-45b0-85ac-7337ddbfdde0.jpg?v=1770026404",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_fcfc3b75-edb6-4146-9432-f29f367c9251.jpg?v=1770026404",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_5686d731-d63e-4af9-b605-dc1bfbade3e0.jpg?v=1770026404",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-813_616f9783-4880-404e-97f0-fba01ea56aad.jpg?v=1787738249",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-815.jpg?v=1785851636",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-817.jpg?v=1785851652",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-826.jpg?v=1785851666",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-828.jpg?v=1785851726",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-830.jpg?v=1785851743",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-833.jpg?v=1785851753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-838.jpg?v=1785851799",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-839.jpg?v=1785851772",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-840.jpg?v=1785851786",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-841.jpg?v=1785851849",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-843.jpg?v=1785851608",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-845.jpg?v=1785851814",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-846.jpg?v=1785851835",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-847.jpg?v=1785851863",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-834_56e263d7-9b73-431d-a7bd-f2d4028226b5.jpg?v=1785938441",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-837_5a1d0fdb-d3fe-422e-a506-2227743b2f86.jpg?v=1785938413",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-835_629f88bf-00d1-4d52-b1e7-f7effb07d310.jpg?v=1785938426",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-02_0d33dec3-6493-44d0-8248-e1450743b893.jpg?v=1786010277",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-03_3555f0f2-f1d5-434b-9354-b135cca32b22.jpg?v=1786010298",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-04_8c19108c-db80-4c56-b23a-2d0fb0c214b1.jpg?v=1786010317",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-05_8a50b9aa-686d-42e4-babd-dd0b1947c9b7.jpg?v=1786010324",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-06_53bed45d-e766-4fda-bc09-51ca14bc95e7.jpg?v=1786010336",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-07_934bbc07-d3bd-4a97-ae06-60bdfab42376.jpg?v=1786355597",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-08_060e3b57-a78f-465e-99f9-121f12d9cd6a.jpg?v=1786010372",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-09_2c4cc29f-576d-4221-9bed-9a5e048ed6d2.jpg?v=1786010389",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-10_0f0b339f-952d-4c2b-b9ea-1ee753efa3bb.jpg?v=1786010399",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-11.jpg?v=1786010420",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-701.jpg?v=1788263767",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-702.jpg?v=1788263655",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-704.jpg?v=1788263720",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-709.jpg?v=1788263910",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-710.jpg?v=1788263840",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-712.jpg?v=1788263686",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-713.jpg?v=1788263789",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-716.jpg?v=1788263640",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-718.jpg?v=1788263826",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-719.jpg?v=1788263856",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-720.jpg?v=1788263924",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-723.jpg?v=1788263576",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-725.jpg?v=1788263744",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-727.jpg?v=1788263626",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-729.jpg?v=1788263873",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-730.jpg?v=1788263596",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-731.jpg?v=1788263612",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-732.jpg?v=1788263808",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-734.jpg?v=1788263549",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-735.jpg?v=1788263702",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-736.jpg?v=1788263562",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-737.jpg?v=1788263671",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-699.jpg?v=1788263898",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_2.jpg?v=1788335536",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_3.jpg?v=1788335550",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_4.jpg?v=1788335565",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_5.jpg?v=1788335577",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_6.jpg?v=1788335595",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_7.jpg?v=1788335607",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_8.jpg?v=1788335622",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_9.jpg?v=1788335636",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Jade_Artboard_10.jpg?v=1788335655"
    ],
    "descriptionHtml": "Are you a sucker for succulents? The Crassula Green Mini will be your dream plant kid. One of the easiest houseplants to look after, the Crassula Green Mini boasts a lush foliage which beautifies any room. Also considered lucky as per Feng Shui for its coin like round plump leaves, so go on, bring some green home, the luck just tags along for free..",
    "tags": [
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "flash",
      "low-maintenance",
      "lucky-feng",
      "retail-store",
      "Succulent",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41368062656644",
        "title": "Small / GroPot / Mocca",
        "price": 199,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0081"
      },
      {
        "id": "41371110965380",
        "title": "Small / Krish / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081KIY"
      },
      {
        "id": "41371111129220",
        "title": "Small / Krish / White",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081KWT"
      },
      {
        "id": "41371111096452",
        "title": "Small / Krish / Brown",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081KBN"
      },
      {
        "id": "51199089770628",
        "title": "Small / Kyoto / Mocca",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081QMC"
      },
      {
        "id": "51199089737860",
        "title": "Small / Kyoto / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081QIY"
      },
      {
        "id": "51199089803396",
        "title": "Small / Kyoto / Terracotta",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081QTC"
      },
      {
        "id": "51836917153924",
        "title": "Small / Yoda / Mocca",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081YMC"
      },
      {
        "id": "51836917186692",
        "title": "Small / Yoda / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081YIY"
      },
      {
        "id": "51836917219460",
        "title": "Small / Yoda / Terracotta",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0081YTC"
      },
      {
        "id": "41371111358596",
        "title": "Small / Lagos / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0081LMC"
      },
      {
        "id": "41371111522436",
        "title": "Small / Lagos / White",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0081LWT"
      },
      {
        "id": "41371111391364",
        "title": "Small / Lagos / Grey",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0081LGY"
      },
      {
        "id": "51178480468100",
        "title": "Small / Roma / White",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081RWT"
      },
      {
        "id": "51178586439812",
        "title": "Small / Roma / Grey",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081RGR"
      },
      {
        "id": "51178480500868",
        "title": "Small / Roma / Magenta",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081RMJ"
      },
      {
        "id": "51178480533636",
        "title": "Small / Roma / Carton Brown",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081RCB"
      },
      {
        "id": "51178480566404",
        "title": "Small / Roma / Peach",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081RPC"
      },
      {
        "id": "41575132856452",
        "title": "Small / Diamond / White",
        "price": 499,
        "compareAtPrice": 590,
        "available": true,
        "sku": "NUPL0081DWT"
      },
      {
        "id": "52759440392324",
        "title": "Medium / Diamond / White",
        "price": 699,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0531DWT"
      },
      {
        "id": "51176936800388",
        "title": "Small / Diamond / Magenta",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081DMJ"
      },
      {
        "id": "51178425712772",
        "title": "Small / Diamond / Carton Brown",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081DCB"
      },
      {
        "id": "51178453991556",
        "title": "Small / Diamond / Peach",
        "price": 499,
        "compareAtPrice": 590,
        "available": false,
        "sku": "NUPL0081DPC"
      },
      {
        "id": "51836917252228",
        "title": "Small / Table Top / White",
        "price": 499,
        "compareAtPrice": 590,
        "available": true,
        "sku": "NUPL0081TWT"
      },
      {
        "id": "41371111719044",
        "title": "Small / Spiro / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0081SWT"
      },
      {
        "id": "41371111686276",
        "title": "Small / Spiro / Pink",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0081SPK"
      },
      {
        "id": "41371111555204",
        "title": "Small / Spiro / Sky Blue",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0081SSB"
      },
      {
        "id": "41371111587972",
        "title": "Small / Spiro / Cadet Blue",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0081SCB"
      },
      {
        "id": "41371111620740",
        "title": "Small / Spiro / Turquoise Blue",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0081STQ"
      },
      {
        "id": "41371111653508",
        "title": "Small / Spiro / Black",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0081SBK"
      },
      {
        "id": "51178457694340",
        "title": "Small / Grail / White",
        "price": 349,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0081GWT"
      },
      {
        "id": "51178457727108",
        "title": "Small / Grail / Magenta",
        "price": 349,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0081GMJ"
      },
      {
        "id": "51178457759876",
        "title": "Small / Grail / Carton Brown",
        "price": 349,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0081GCB"
      },
      {
        "id": "51178457792644",
        "title": "Small / Grail / Peach",
        "price": 349,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0081GPC"
      },
      {
        "id": "41368217550980",
        "title": "Medium / GroPot / Mocca",
        "price": 399,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0531"
      },
      {
        "id": "41371111915652",
        "title": "Medium / Krish / Ivory",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0531KIY"
      },
      {
        "id": "52759472570500",
        "title": "Medium / Krish / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0531KWT"
      },
      {
        "id": "41371112079492",
        "title": "Medium / Krish / Brown",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0531KBN"
      },
      {
        "id": "41371112603780",
        "title": "Medium / Grail / Peach",
        "price": 899,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0531GPC"
      },
      {
        "id": "52759426826372",
        "title": "Medium / Grail / White",
        "price": 899,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0531GWT"
      },
      {
        "id": "41582675001476",
        "title": "Medium / Prism / Ivory",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0531PIY"
      },
      {
        "id": "41582674968708",
        "title": "Medium / Prism / White",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0531PWG"
      },
      {
        "id": "52759387832452",
        "title": "Medium / Prism / Dark Green",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0531PMG"
      },
      {
        "id": "41582675067012",
        "title": "Medium / Aurelius / White",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0531AWG"
      },
      {
        "id": "41582675034244",
        "title": "Medium / Aurelius / Grey",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0531AGG"
      },
      {
        "id": "52759346512004",
        "title": "Medium / Aurelius / Dark Green",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0531AMG"
      },
      {
        "id": "52759302832260",
        "title": "Medium / York / Mocca",
        "price": 499,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0531YRM"
      },
      {
        "id": "52759302865028",
        "title": "Medium / York / White",
        "price": 499,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0531YRW"
      },
      {
        "id": "52759302897796",
        "title": "Medium / York / Terracotta",
        "price": 499,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0531YRT"
      },
      {
        "id": "52759322656900",
        "title": "Medium / Roma / Gray",
        "price": 799,
        "compareAtPrice": 199,
        "available": false,
        "sku": "NUPL0531RGY"
      },
      {
        "id": "52759323803780",
        "title": "Medium / Roma / White",
        "price": 799,
        "compareAtPrice": 199,
        "available": false,
        "sku": "NUPL0531RWT"
      },
      {
        "id": "52759333011588",
        "title": "Medium / Frosted / White",
        "price": 899,
        "compareAtPrice": 199,
        "available": false,
        "sku": "NUPL0531FWT"
      },
      {
        "id": "52759334322308",
        "title": "Medium / Frosted / Dusty rose",
        "price": 899,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0531FDR"
      }
    ]
  },
  {
    "id": "6940828795012",
    "handle": "money-plant-golden",
    "title": "Money Plant Golden",
    "category": "plants",
    "subCategory": "plants",
    "price": 199,
    "compareAtPrice": 199,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 185,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-498.jpg?v=1785592392",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-498.jpg?v=1785592392",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-06_f597999f-e5da-4e96-8ed7-191eec9d6888.jpg?v=1788508498",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-500.jpg?v=1785592479",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden_2_1_copy.jpg?v=1788422070",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-503.jpg?v=1785592554",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-507.jpg?v=1785592541",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-509.jpg?v=1785592573",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden_2_1_copy_17.jpg?v=1788422014",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden_2_1_copy_9.jpg?v=1788422031",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden_2_1_copy_7.jpg?v=1788422084",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden_2_1_copy_18.jpg?v=1788422114",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-516.jpg?v=1785592615",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-517.jpg?v=1785592602",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-518.jpg?v=1785592588",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-519.jpg?v=1785592674",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden_2_1_copy_8.jpg?v=1788422056",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-520.jpg?v=1785592660",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-521.jpg?v=1785592632",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-522.jpg?v=1785592646",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-523.jpg?v=1785592692",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-481.jpg?v=1785592434",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-483.jpg?v=1785592451",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-485.jpg?v=1785592465",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-493.jpg?v=1785592406",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-496.jpg?v=1785592421",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-514_d1a25ea3-4d58-4cf4-89d3-0491ab7d6a08.jpg?v=1785938354",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-511_b7d250cf-d038-43d9-8008-c13d5651ec5a.jpg?v=1785938335",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-512_ab3245e8-d43a-4400-971f-a52abe9440a2.jpg?v=1785938320",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-02_bfd024ae-8366-4ecf-afee-553e3983b7f0.jpg?v=1786636395",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Moneyplantgolden-04.jpg?v=1786636409",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-03.jpg?v=1786010010",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-04.jpg?v=1786010025",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-05.jpg?v=1786010037",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-06.jpg?v=1786010116",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-07.jpg?v=1786010085",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-08.jpg?v=1786010068",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-09.jpg?v=1786010057",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_plant_golden-10.jpg?v=1786010096",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden-01_ccc94ec8-989b-46a0-9a60-1eb67727a8e9.jpg?v=1786701477",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden-02_de927828-b72f-4e56-aff1-53e26e1c536f.jpg?v=1786701194",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden-03_74bd87de-0999-4dad-861b-ff32faaf5d76.jpg?v=1786701222",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden-04_73364bb1-c956-4489-8112-f9741d902797.jpg?v=1786701208",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Golden-05_476d785d-5d79-4cc3-a2c6-040c5c3207cc.jpg?v=1786701236",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-621.jpg?v=1788264054",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-622.jpg?v=1788264104",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-623.jpg?v=1788264028",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-625.jpg?v=1788264269",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-627.jpg?v=1788264040",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-628.jpg?v=1788264199",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-630.jpg?v=1788264148",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-633.jpg?v=1788264227",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-634.jpg?v=1788264288",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-637.jpg?v=1788263940",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-641.jpg?v=1788263953",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-642.jpg?v=1788263971",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-645.jpg?v=1788264088",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-646.jpg?v=1788264013",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-647.jpg?v=1788264175",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-648.jpg?v=1788264213",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-649.jpg?v=1788264117",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-650.jpg?v=1788264164",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-651.jpg?v=1788264133",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-652.jpg?v=1788263989",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-653.jpg?v=1788264240",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-655.jpg?v=1788264256",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-620.jpg?v=1788264096",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_2.jpg?v=1788336057",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Moneyplantgolden-04_c1650faf-a21f-4669-9c18-6fb7bb15dc05.jpg?v=1788335449",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_3.jpg?v=1788336254",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_4.jpg?v=1788336284",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_5.jpg?v=1788336268",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_6.jpg?v=1788336329",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_7.jpg?v=1788336314",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_8.jpg?v=1788336296",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_9.jpg?v=1788336224",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_Plant_golden_Artboard_10.jpg?v=1788336238"
    ],
    "descriptionHtml": "<p dir=\"ltr\"><span>A beloved indoor plant around the world, the </span><span>Money Plant Golden</span><span> is every gardener’s favorite and with very good reason! Highly adaptable, versatile, low maintenance, and timeless, the </span><span>Money Plant Gold</span><span>en</span><span> graces almost every garden, everywhere. This plant can survive some periods of neglect and continue to grace your gardens with an evergreen elegance. </span><span>Its</span><span> growth patterns also allow it to grow well as a cascading vine or a creeping plant when trained. </span></p>\n<p> </p>",
    "tags": [
      "air-purifying",
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "flash",
      "low-light",
      "low-maintenance",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41371648884868",
        "title": "Small / GroPot / Mocca",
        "price": 199,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0016"
      },
      {
        "id": "41371649835140",
        "title": "Small / Krish / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016KIY"
      },
      {
        "id": "41371648917636",
        "title": "Small / Krish / White",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016KWT"
      },
      {
        "id": "41371649900676",
        "title": "Small / Krish / Brown",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016KBN"
      },
      {
        "id": "51200227049604",
        "title": "Small / Kyoto / Mocca",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016QMC"
      },
      {
        "id": "51200227016836",
        "title": "Small / Kyoto / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016QIY"
      },
      {
        "id": "51200227082372",
        "title": "Small / Kyoto / Terracotta",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016QTC"
      },
      {
        "id": "51846480199812",
        "title": "Small / Yoda / Mocca",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016YMC"
      },
      {
        "id": "51846480232580",
        "title": "Small / Yoda / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016YIY"
      },
      {
        "id": "51846480265348",
        "title": "Small / Yoda / Terracotta",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0016YTC"
      },
      {
        "id": "41371649998980",
        "title": "Small / Lagos / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0016LMC"
      },
      {
        "id": "41371648950404",
        "title": "Small / Lagos / White",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0016LWT"
      },
      {
        "id": "41371650031748",
        "title": "Small / Lagos / Grey",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0016LGY"
      },
      {
        "id": "51179764809860",
        "title": "Small / Roma / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016RWT"
      },
      {
        "id": "51179764842628",
        "title": "Small / Roma / Grey",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016RGR"
      },
      {
        "id": "51179765792900",
        "title": "Small / Roma / Peach",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016RPC"
      },
      {
        "id": "51179765825668",
        "title": "Small / Roma / Magenta",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016RMJ"
      },
      {
        "id": "51179765858436",
        "title": "Small / Roma / Carton Brown",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016RCB"
      },
      {
        "id": "41579581866116",
        "title": "Small / Diamond / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0016DWT"
      },
      {
        "id": "52759598039172",
        "title": "Medium / Diamond / White",
        "price": 699,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0842DWT"
      },
      {
        "id": "51179765596292",
        "title": "Small / Diamond / Peach",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016DPC"
      },
      {
        "id": "51179765629060",
        "title": "Small / Diamond / Magenta",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016DMJ"
      },
      {
        "id": "51179765661828",
        "title": "Small / Diamond / Carton Brown",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016DCB"
      },
      {
        "id": "51846480298116",
        "title": "Small / Table Top / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0016TWT"
      },
      {
        "id": "41371649015940",
        "title": "Small / Spiro / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016SWT"
      },
      {
        "id": "41371650097284",
        "title": "Small / Spiro / Black",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016SBK"
      },
      {
        "id": "41371650359428",
        "title": "Small / Spiro / Pink",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0016SPK"
      },
      {
        "id": "41371650261124",
        "title": "Small / Spiro / Cadet Blue",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0016SCB"
      },
      {
        "id": "41371650293892",
        "title": "Small / Spiro / Sky Blue",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0016SSB"
      },
      {
        "id": "41371650326660",
        "title": "Small / Spiro / Turquoise Blue",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0016STQ"
      },
      {
        "id": "51179764777092",
        "title": "Small / Grail / White",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0016GWT"
      },
      {
        "id": "51179765694596",
        "title": "Small / Grail / Peach",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0016GPC"
      },
      {
        "id": "51179765727364",
        "title": "Small / Grail / Magenta",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0016GMJ"
      },
      {
        "id": "51179765760132",
        "title": "Small / Grail / Carton Brown",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0016GCB"
      },
      {
        "id": "41412874502276",
        "title": "Medium / GroPot / Mocca",
        "price": 399,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0842"
      },
      {
        "id": "41412874535044",
        "title": "Medium / Krish / Ivory",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0842KIY"
      },
      {
        "id": "52759627137156",
        "title": "Medium / Krish / Yellow",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0842KYL"
      },
      {
        "id": "41412874567812",
        "title": "Medium / Krish / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0842KWT"
      },
      {
        "id": "41412874633348",
        "title": "Medium / Krish / Brown",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0842KBN"
      },
      {
        "id": "52759534502020",
        "title": "Medium / Roma / White",
        "price": 799,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0842RWT"
      },
      {
        "id": "52759532732548",
        "title": "Medium / Roma / Grey",
        "price": 799,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0842RGY"
      },
      {
        "id": "41412874895492",
        "title": "Medium / Grail / Peach",
        "price": 899,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0842GPC"
      },
      {
        "id": "52759589191812",
        "title": "Medium / Grail / White",
        "price": 899,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0842GWT"
      },
      {
        "id": "41579581997188",
        "title": "Medium / Prism / Ivory",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0842DIY"
      },
      {
        "id": "41579581964420",
        "title": "Medium / Prism / White",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0842PWT"
      },
      {
        "id": "52759578148996",
        "title": "Medium / Prism / Dark Green",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0842PMG"
      },
      {
        "id": "41582654652548",
        "title": "Medium / Aurelius / White",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0842AWG"
      },
      {
        "id": "41582654685316",
        "title": "Medium / Aurelius / Grey",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0842AGG"
      },
      {
        "id": "52759571824772",
        "title": "Medium / Aurelius / Dark Green",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0842AMG"
      },
      {
        "id": "52759507206276",
        "title": "Medium / York / Mocca",
        "price": 499,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0842YRM"
      },
      {
        "id": "52759502946436",
        "title": "Medium / York / White",
        "price": 499,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0842YRW"
      },
      {
        "id": "52759509926020",
        "title": "Medium / York / Terracotta",
        "price": 499,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0842YRT"
      },
      {
        "id": "52759549542532",
        "title": "Medium / Frosted / White",
        "price": 899,
        "compareAtPrice": 199,
        "available": false,
        "sku": "NUPL0842FWT"
      },
      {
        "id": "52759553867908",
        "title": "Medium / Frosted / Dusty Rose",
        "price": 899,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0842FDR"
      }
    ]
  },
  {
    "id": "6941156704388",
    "handle": "areca-palm-plant-xl",
    "title": "Areca Palm Plant XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 1799,
    "compareAtPrice": 2100,
    "discountPercent": 14,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 151,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_1l79nf8r4r.jpg?v=1788436362",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_1l79nf8r4r.jpg?v=1788436362",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/JackieA_image-17.jpg?v=1788522796",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_2.jpg?v=1790065155",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_3.jpg?v=1790065136",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_4.jpg?v=1790065122",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_5.jpg?v=1790065244",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_6.jpg?v=1790065261",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_7.jpg?v=1790065108",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_8.jpg?v=1790065094",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_Artboard_10.jpg?v=1790065172"
    ],
    "descriptionHtml": "Once an endangered species, the Areca Palm is a staple in Indian spaces. One of the most undervalued plants in the indoor plant category. This excellent air purifier is pet friendly and easy to grow. Its delicate leaves/fronds grow outwards in a curved manner and add a tropical feel to any space and can adapt to a variety of growing conditions.",
    "tags": [
      "3500",
      "air-purifying",
      "buy2",
      "featured",
      "flash",
      "morden",
      "pet-friendly",
      "retail-store",
      "special",
      "top-200-sku",
      "XL-Plant",
      "XL_birthday"
    ],
    "variants": [
      {
        "id": "40859668119684",
        "title": "Default Title",
        "price": 1799,
        "compareAtPrice": 2100,
        "available": true,
        "sku": "NUPL0596"
      }
    ]
  },
  {
    "id": "6941171187844",
    "handle": "monstera-deliciosa-plant-xl",
    "title": "Monstera Deliciosa Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 2499,
    "compareAtPrice": 3000,
    "discountPercent": 17,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 207,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_ksw4zKR16B.jpg?v=1788436422",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_ksw4zKR16B.jpg?v=1788436422",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-01.jpg?v=1788508550",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_2.jpg?v=1790065423",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_3.jpg?v=1790064924",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_4.jpg?v=1790063699",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_5.jpg?v=1790063715",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_6.jpg?v=1790064690",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_7.jpg?v=1790063686",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_8.jpg?v=1790063657",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_Plant__Artboard_10.jpg?v=1790063672"
    ],
    "descriptionHtml": "<p dir=\"ltr\"><span>Looking to uplift your home decor with some tropical aesthetics? This </span><span>large Monstera plant</span><span> will do just that for you and easily become one of your favorite indoor plants. Also called the Swiss Cheese Plant, the Monstera Deliciosa is a tropical stunner brought indoors, charming people everywhere with its large leaves and wonderful fenestrations that resemble a Swiss cheese slice.</span></p>",
    "tags": [
      "3500",
      "Birthday_plants",
      "featured",
      "flash",
      "low-maintenance",
      "morden",
      "retail-store",
      "special",
      "Stress-reducer",
      "top-200-sku",
      "XL-Plant",
      "XL_birthday"
    ],
    "variants": [
      {
        "id": "40859710914692",
        "title": "Default Title",
        "price": 2499,
        "compareAtPrice": 3000,
        "available": true,
        "sku": "NUPL0631"
      }
    ]
  },
  {
    "id": "6941156999300",
    "handle": "the-china-doll-plant-xl",
    "title": "The China Doll Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 1799,
    "compareAtPrice": 2100,
    "discountPercent": 14,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 93,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_dtfHlihXSL.jpg?v=1788436408",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_dtfHlihXSL.jpg?v=1788436408",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-03.jpg?v=1788508516",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_2.jpg?v=1790064702",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_3.jpg?v=1790064717",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_4.jpg?v=1790064736",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_5.jpg?v=1790064749",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_6.jpg?v=1790064811",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_7.jpg?v=1790064795",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_8.jpg?v=1790064777",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/China_Doll_Artboard_10.jpg?v=1790064764"
    ],
    "descriptionHtml": "<ul>\n<li dir=\"ltr\">\n<span>With its glossy green leaves and large growth, this </span><span>indoor China Doll plant </span><span>is basically a tree. </span>\n</li>\n<li dir=\"ltr\">\n<span>The woody branches of the </span><span>Radermachera sinica </span><span>complement its dark green leaves perfectly, creating the most wonderful indoor aesthetics. </span>\n</li>\n<li dir=\"ltr\">\n<span>Interestingly, the plant being called the </span><span>China Doll Tree</span><span> has nothing to do with the country but everything to do with the fact that the tree looks - quite literally - like a doll house tree. </span>\n</li>\n<li dir=\"ltr\"><span>The best part? This plant is relatively easy to care for and adds an instant forest-like feel to any space, serving as an excellent plant for balconies and patios.</span></li>\n</ul>\n<p> </p>",
    "tags": [
      "3500",
      "air-purifying",
      "featured",
      "flash",
      "low-maintenance",
      "morden",
      "pet-friendly",
      "retail-store",
      "special",
      "top-200-sku",
      "XL-Plant",
      "XL_birthday"
    ],
    "variants": [
      {
        "id": "40859668643972",
        "title": "Default Title",
        "price": 1799,
        "compareAtPrice": 2100,
        "available": true,
        "sku": "NUPL0586"
      }
    ]
  },
  {
    "id": "6940420243588",
    "handle": "bird-of-paradise-plant-xl",
    "title": "Bird of Paradise Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 2499,
    "compareAtPrice": 3000,
    "discountPercent": 17,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 83,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img2_p8vQLhTehw_b4d06055-94d0-4b63-92f2-2db379c56d32.jpg?v=1788443536",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img2_p8vQLhTehw_b4d06055-94d0-4b63-92f2-2db379c56d32.jpg?v=1788443536",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image.jpg?v=1788522900",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_2.jpg?v=1790065014",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_3.jpg?v=1790064994",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_4.jpg?v=1790065062",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_5.jpg?v=1790065196",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_6.jpg?v=1790065051",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_7.jpg?v=1790065182",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_8.jpg?v=1790065035",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Birds_of_paradise__Artboard_10.jpg?v=1790064976"
    ],
    "descriptionHtml": "<ul>\n<li>The Strelitzia nicolai, more famous as the Bird of Paradise plant, is given its name due to its wild blue-orange flowers that closely resemble its namesake bird.</li>\n<li>A close relative of the Banana family, it is an easier and more tolerant tropical plant to grow at home.</li>\n<li>This stunning plant does beautifully in bright, indirect light and rewards you with its graceful arching leaves, making for a beautiful housemate.</li>\n<li>While the plant does not flower indoors, its captivating foliage is more than enough to make up for it, giving the plant the center stage no matter where you put it!</li>\n</ul>",
    "tags": [
      "Aesthetic",
      "featured",
      "flash",
      "morden",
      "retail-store",
      "special",
      "top-200-sku",
      "XL-Plant"
    ],
    "variants": [
      {
        "id": "40858056360068",
        "title": "Default Title",
        "price": 2499,
        "compareAtPrice": 3000,
        "available": true,
        "sku": "NUPL0603"
      }
    ]
  },
  {
    "id": "6940956590212",
    "handle": "aglaonema-pink-beauty-plant",
    "title": "Aglaonema Pink Beauty Plant - Medium",
    "category": "plants",
    "subCategory": "plants",
    "price": 599,
    "compareAtPrice": 700,
    "discountPercent": 14,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 217,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-13.jpg?v=1788522750",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-13.jpg?v=1788522750",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-750.jpg?v=1787809994",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-749.jpg?v=1787810083",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-761.jpg?v=1787810186",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-762.jpg?v=1787810248",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-764.jpg?v=1787809933",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-766.jpg?v=1787810262",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-765.jpg?v=1787810024",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-769.jpg?v=1787810148",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-772.jpg?v=1787810201",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-774.jpg?v=1787809975",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-777.jpg?v=1787810037",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-779.jpg?v=1787809960",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-781.jpg?v=1787810010",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-782.jpg?v=1787810214",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-783.jpg?v=1787810056",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-786.jpg?v=1787810172",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-785.jpg?v=1788004348",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-787.jpg?v=1787810234",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-788.jpg?v=1787809947",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-790.jpg?v=1787810111",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-746.jpg?v=1787810113",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_2.jpg?v=1787997148",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_3.jpg?v=1787997160",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_5.jpg?v=1787997175",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_4.jpg?v=1787997194",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_6.jpg?v=1787997209",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_7.jpg?v=1787997221",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_8.jpg?v=1787997238",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_9.jpg?v=1787997253",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglaonema_Pink_Beauty_Artboard_10.jpg?v=1787997267"
    ],
    "descriptionHtml": "<ul>\n<li>If you are a first time gardener looking for an easy one, Aglaonema Pink Beauty is the plant for you.</li>\n<li>Also called the Chinese Evergreen, it will stay happy and beautiful in low indirect light with little water.</li>\n<li>Its bright pink leaves add the right amount of jazz and colour to any space and décor.</li>\n<li>Its a stunner with its pretty pink foliage both alone and in plant clusters.</li>\n</ul>",
    "tags": [
      "air-purifying",
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "flash",
      "low-light",
      "low-maintenance",
      "Plants",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "40859209400452",
        "title": "GroPot / Mocca",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0204"
      },
      {
        "id": "41391924019332",
        "title": "Krish / Ivory",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0204KIY"
      },
      {
        "id": "41391924052100",
        "title": "Krish / Red",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0204KRD"
      },
      {
        "id": "52738533687428",
        "title": "Krish / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0204KWT"
      },
      {
        "id": "52738406940804",
        "title": "York / Mocca",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0204YRM"
      },
      {
        "id": "52738406908036",
        "title": "York / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0204YRW"
      },
      {
        "id": "52738406973572",
        "title": "York / Terracotta",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0204YRT"
      },
      {
        "id": "52738589098116",
        "title": "Frosted / White",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0204FWT"
      },
      {
        "id": "52738590212228",
        "title": "Frosted / Dusty Rose",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": true,
        "sku": "NUPL0204FDR"
      },
      {
        "id": "52738537422980",
        "title": "Grail / White",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0204GWT"
      },
      {
        "id": "41391924281476",
        "title": "Grail / Peach",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0204GPC"
      },
      {
        "id": "41584630988932",
        "title": "Aurelius / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0204AWG"
      },
      {
        "id": "41584630956164",
        "title": "Aurelius / Grey",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0204AGG"
      },
      {
        "id": "52738534867076",
        "title": "Aurelius / Dark Green",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0204AGM"
      },
      {
        "id": "41584631021700",
        "title": "Prism / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0204DWG"
      },
      {
        "id": "52738535260292",
        "title": "Prism / Dark Green",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0204PGM"
      },
      {
        "id": "52738535129220",
        "title": "Prism / Cream",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0204PGC"
      }
    ]
  },
  {
    "id": "6940858253444",
    "handle": "lucky-bamboo-plant-3-layer",
    "title": "Lucky Bamboo Plant - 3 Layer",
    "category": "plants",
    "subCategory": "plants",
    "price": 399,
    "compareAtPrice": 400,
    "discountPercent": 0,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 150,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-669.jpg?v=1785859525",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-669.jpg?v=1785859525",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/JackieA_image-14_1.jpg?v=1788522919",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-665.jpg?v=1785859495",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-668.jpg?v=1785859512",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_3_Layer_Artboard_2.jpg?v=1786011074",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_3_Layer_Artboard_3.jpg?v=1786011056",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_3_Layer_Artboard_4.jpg?v=1786011044",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_3_Layer_Artboard_6.jpg?v=1786011014",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_3_Layer_Artboard_8.jpg?v=1786011092",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_3_Layer_Artboard_11.jpg?v=1786011102",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_3_Layer_Artboard_10.jpg?v=1786011031"
    ],
    "descriptionHtml": "<span style=\"font-weight: 400;\">Easy to grow and care for, the Lucky Bamboo plant is a popular indoor plant because of more reasons </span><span style=\"font-weight: 400;\">than</span><span style=\"font-weight: 400;\"> just its care requirements. According to Feng Shui, this is one of the best lucky plants for homes, and its reputation as such greatly adds to its charm and allure. Additionally, it is also a great gifting option that works as a personal pick-me-up!</span>",
    "tags": [
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "Easy-care",
      "featured",
      "flash",
      "low-light",
      "low-maintenance",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41701177655428",
        "title": "Glass Bowl",
        "price": 399,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0098"
      },
      {
        "id": "41701177884804",
        "title": "Candle Jar",
        "price": 549,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL3099"
      },
      {
        "id": "41701177917572",
        "title": "Potters Wheel",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL3098"
      }
    ]
  },
  {
    "id": "6940830662788",
    "handle": "money-plant-variegated",
    "title": "Money Plant Variegated",
    "category": "plants",
    "subCategory": "plants",
    "price": 199,
    "compareAtPrice": 199,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 204,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Venice12Planter-LightGrey_51d6f798-8cc2-49c0-a7e1-883aedf0861a.jpg?v=1741079758",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Venice12Planter-LightGrey_51d6f798-8cc2-49c0-a7e1-883aedf0861a.jpg?v=1741079758",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/AtlantisPlanter-PastelYellow_4d110018-ecc4-41d5-9f35-18dbfc55dced.jpg?v=1741079758",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833.jpg?v=1741079758",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/AtlantisPlanter-MidnightBlue_6cdbd527-2546-4b87-9d4b-aae0716ebeb4.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_1e0222c1-5296-469c-bd38-f9a4c5984319.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/AtlantisPlanter-PastelBlue_09399cd8-7549-4bfe-ab29-2de36cb313f1.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_9c331a0f-a78f-4ec3-ada9-c71f05c2ba7a.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/AtlantisPlanter-PastelPink_1a52bec2-054c-44b1-b6d6-4222beb81b3c.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_2063d262-c95a-499a-8ec0-a84ac11d8a60.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/AtlantisPlanter-Teal_39d93c6a-c7d7-4ae3-89a8-6cb62d0de69c.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_9e991016-8e99-4f0a-9ad6-6507d237f3b3.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_e99af181-da0d-4d8b-a2ff-8ea3bf3164ec.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_540e37cf-217a-45b5-b2ab-d94e7f2ebf9f.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_4fc91d4a-7d51-4642-89f4-b9252d11bf7f.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/KrishPlanter-LightGreen_2fb5f9ba-c584-405f-ba07-4d2af56e1898.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_9e15e804-a3b5-4c5c-bb50-eb1d43cc315d.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_f099e9c4-a02d-4470-a9e0-6256900a3793.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_459d5f69-897b-4c2c-a052-d8d68947cc3e.jpg?v=1741079753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_21497519-b92e-4493-a77a-c3fe4d7304d2.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_3772a4f0-2245-4203-bc25-ce1a015ddbed.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/LagosPlanter-Mocca_a8b47d39-d673-4c9f-9c4d-8b2cb02b4aef.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_9a44f4c6-eb26-4152-bfa0-4ad1745498ae.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_ca0cce7f-f621-435b-97ff-7cb0dec3ee6c.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-Black_fe713888-7b39-41b8-990f-ef2c61b31637.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_67e6cf3f-ebb1-4d89-836f-35b1a209a9f9.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-Pink_6d82f699-62fe-432c-a800-fa75549d1bc4.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_71d5b6bd-81e2-413f-9921-947f7c633944.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-SkyBlue_1cce063b-a272-4478-9900-79acc3c46902.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_ff8dcb90-8236-49ad-bd23-e036d9e51440.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-CadetBlue_4e86f12c-9953-416c-817f-927c0de14d65.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_f4dc5141-5272-4cb9-ac6a-cb15e7cb9c1c.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-TurquoiseBlue_53cd60e5-5d18-4952-94e6-60f1a53fdd71.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_9d4e4cfb-09e7-4fda-ba6c-80ab81b5e26c.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-White_d64edf00-5e0d-4f62-b9c7-053372f9b4a9.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_8833_80e1dac5-b067-402f-aaf0-6436389b0e13.jpg?v=1706609610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Venice12Planter-Black_ea2aedda-9f9e-45bd-bcc4-49404e28cc30.jpg?v=1707726542",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/DSC_3285-2_faa047c5-25ec-4ee0-8a80-b18e1835abfa.jpg?v=1707726542",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Venice12Planter-White_613b1273-6540-44a0-bf9f-f115a9eb46fe.jpg?v=1707726542",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVDCB1.jpg?v=1759826851",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVDM1.jpg?v=1759826984",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVDP1.jpg?v=1759826984",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVDW1.jpg?v=1759826984",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVGCB1.jpg?v=1759827692",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVGM1.jpg?v=1759827693",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVGP1.jpg?v=1759827692",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVGW1.jpg?v=1759827692",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVRCB1.jpg?v=1759827748",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVRG1.jpg?v=1759827749",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVRM1.jpg?v=1759827749",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MPVRP1.jpg?v=1759827749",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-531.jpg?v=1785578126",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-533.jpg?v=1785578141",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-534.jpg?v=1785578154",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-535.jpg?v=1785577996",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-538.jpg?v=1785578010",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-539.jpg?v=1785578024",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-541.jpg?v=1785578173",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-545.jpg?v=1785578038",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-547.jpg?v=1785578056",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-548.jpg?v=1785578071",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-558.jpg?v=1785578247",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-560.jpg?v=1785578234",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-561.jpg?v=1785578263",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-562.jpg?v=1785578082",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-563.jpg?v=1785578274",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-566.jpg?v=1785578096",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-567.jpg?v=1785578113",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-565.jpg?v=1785578294",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-551_9fe73ee2-f9b2-4207-9a12-455c433117ad.jpg?v=1785938274",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-554_99caf363-a76e-40b9-9cc7-417744528290.jpg?v=1785938307",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-552_6a0c21fc-70d6-4133-8923-199eae6d939e.jpg?v=1785938295",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-2.jpg?v=1786003001",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated__Artboard_5.jpg?v=1786003018",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-3.jpg?v=1786002989",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-4.jpg?v=1786003036",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-5.jpg?v=1786002960",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-6.jpg?v=1786002977",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-7.jpg?v=1786003063",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-8.jpg?v=1786003075",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-9.jpg?v=1786003050",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated_-10.jpg?v=1786003095",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Variegated-01.jpg?v=1786708394",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Variegated-02.jpg?v=1786708348",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Variegated-03.jpg?v=1786708335",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Variegated-04.jpg?v=1786708365",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Money_Plant_Variegated-05.jpg?v=1786708377",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-582.jpg?v=1788342808",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-583.jpg?v=1788343046",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-586.jpg?v=1788342973",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-587.jpg?v=1788342748",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-588.jpg?v=1788343032",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-590.jpg?v=1788342734",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-592.jpg?v=1788342852",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-593.jpg?v=1788342868",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-594.jpg?v=1788343001",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-595.jpg?v=1788342894",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-601.jpg?v=1788342942",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-602.jpg?v=1788342835",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-605.jpg?v=1788343015",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-606.jpg?v=1788342914",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-607.jpg?v=1788343060",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-609.jpg?v=1788342881",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-610.jpg?v=1788342987",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-611.jpg?v=1788342929",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-612.jpg?v=1788342776",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-613.jpg?v=1788342792",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-614.jpg?v=1788342956",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-615.jpg?v=1788342822",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-616.jpg?v=1788342762",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_2.jpg?v=1788343076",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Money_Plant_Variegated__Artboard_5_8d55479e-5d6c-4634-9faa-2ba416460e94.jpg?v=1788345695",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_3.jpg?v=1788343092",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_4.jpg?v=1788343107",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_5.jpg?v=1788343193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_6.jpg?v=1788343182",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_7.jpg?v=1788343121",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_8.jpg?v=1788343135",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_9.jpg?v=1788343152",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Money_plant_variegated_Artboard_10.jpg?v=1788343166"
    ],
    "descriptionHtml": "<p dir=\"ltr\"><span>The stunning </span><span>Money Plant Variegated</span><span> will be your best friend whether or not you’ve got a green thumb. Versatile, hardy, and low maintenance, this indoor plant can light up any space it graces. The wonderful green-yellow variegations add an unmissable charm to it that make it memorable and a great centrepiece for all home interiors!</span></p>\n<p> </p>",
    "tags": [
      "air-purifying",
      "b2g1",
      "buy3",
      "featured",
      "flash",
      "low-maintenance",
      "Plants",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41371580104836",
        "title": "Small / GroPot / Mocca",
        "price": 199,
        "compareAtPrice": 199,
        "available": true,
        "sku": "NUPL0018"
      },
      {
        "id": "41371581612164",
        "title": "Small / Krish / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0018KIY"
      },
      {
        "id": "41371580137604",
        "title": "Small / Krish / White",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0018KWT"
      },
      {
        "id": "41371581677700",
        "title": "Small / Krish / Brown",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0018KBN"
      },
      {
        "id": "51201892089988",
        "title": "Small / Kyoto / Ivory",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0018QIY"
      },
      {
        "id": "51201892122756",
        "title": "Small / Kyoto / Mocca",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0018QMC"
      },
      {
        "id": "51201892155524",
        "title": "Small / Kyoto / Terracotta",
        "price": 249,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUPL0018QTC"
      },
      {
        "id": "41371580170372",
        "title": "Small / Lagos / White",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0018LWT"
      },
      {
        "id": "41371581776004",
        "title": "Small / Lagos / Grey",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0018LGY"
      },
      {
        "id": "41371581841540",
        "title": "Small / Lagos / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0018LMC"
      },
      {
        "id": "41577419374724",
        "title": "Small / Diamond / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0018DWT"
      },
      {
        "id": "52759970316420",
        "title": "Medium / Diamond / White",
        "price": 699,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0843DWT"
      },
      {
        "id": "51180507168900",
        "title": "Small / Diamond / Magenta",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0018DMJ"
      },
      {
        "id": "51180507201668",
        "title": "Small / Diamond / Carton Brown",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0018DCB"
      },
      {
        "id": "51180507234436",
        "title": "Small / Diamond / Peach",
        "price": 499,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUPL0018DPC"
      },
      {
        "id": "41371580235908",
        "title": "Small / Spiro / White",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0018SWT"
      },
      {
        "id": "41371581874308",
        "title": "Small / Spiro / Sky Blue",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0018SSB"
      },
      {
        "id": "41371582070916",
        "title": "Small / Spiro / Pink",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0018SPK"
      },
      {
        "id": "41371582038148",
        "title": "Small / Spiro / Turquoise Blue",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0018STQ"
      },
      {
        "id": "41371582103684",
        "title": "Small / Spiro / Black",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0018SBK"
      },
      {
        "id": "41371582136452",
        "title": "Small / Spiro / Cadet Blue",
        "price": 599,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0018SCB"
      },
      {
        "id": "51180513624196",
        "title": "Small / Grail / White",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018GWT"
      },
      {
        "id": "51180513656964",
        "title": "Small / Grail / Magenta",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018GMJ"
      },
      {
        "id": "51180513689732",
        "title": "Small / Grail / Carton Brown",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018GCB"
      },
      {
        "id": "51180513722500",
        "title": "Small / Grail / Peach",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018GPC"
      },
      {
        "id": "51180513755268",
        "title": "Small / Roma / White",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018RWT"
      },
      {
        "id": "51180513788036",
        "title": "Small / Roma / Magenta",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018RMJ"
      },
      {
        "id": "51180513820804",
        "title": "Small / Roma / Carton Brown",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018RCB"
      },
      {
        "id": "51180513853572",
        "title": "Small / Roma / Peach",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018RPC"
      },
      {
        "id": "51180513886340",
        "title": "Small / Roma / Grey",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0018RGR"
      },
      {
        "id": "41412899373188",
        "title": "Medium / GroPot / Mocca",
        "price": 399,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0843"
      },
      {
        "id": "41412899405956",
        "title": "Medium / Krish / Ivory",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0843KIY"
      },
      {
        "id": "41412899438724",
        "title": "Medium / Krish / White",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0843KWT"
      },
      {
        "id": "41412899504260",
        "title": "Medium / Krish / Brown",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0843KBN"
      },
      {
        "id": "41412899569796",
        "title": "Medium / Krish / Yellow",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0843KYL"
      },
      {
        "id": "41412899700868",
        "title": "Medium / Grail / Peach",
        "price": 899,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0843GPC"
      },
      {
        "id": "52759960879236",
        "title": "Medium / Grail / White",
        "price": 899,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0843GWT"
      },
      {
        "id": "41598246813828",
        "title": "Medium / Aurelius / White",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0843AWT"
      },
      {
        "id": "41598246781060",
        "title": "Medium / Aurelius / Grey",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0843AGG"
      },
      {
        "id": "52759914512516",
        "title": "Medium / Aurelius / Dark Green",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0843AMG"
      },
      {
        "id": "41412899602564",
        "title": "Medium / Venice / White",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0843VWT"
      },
      {
        "id": "41412899668100",
        "title": "Medium / Venice / Black",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0843VBK"
      },
      {
        "id": "41412899635332",
        "title": "Medium / Venice / Light Grey",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0843VLG"
      },
      {
        "id": "41598246879364",
        "title": "Medium / Prism / White",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0843PWG"
      },
      {
        "id": "52759868964996",
        "title": "Medium / York / White",
        "price": 499,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0843YRW"
      },
      {
        "id": "52759871357060",
        "title": "Medium / York / Mocca",
        "price": 499,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0843YRM"
      },
      {
        "id": "52759873126532",
        "title": "Medium / York / Terracotta",
        "price": 499,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0843YRT"
      },
      {
        "id": "52759877288068",
        "title": "Medium / Roma / Grey",
        "price": 799,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0843RGY"
      },
      {
        "id": "52759879057540",
        "title": "Medium / Roma / White",
        "price": 799,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0843RWT"
      },
      {
        "id": "52759910482052",
        "title": "Medium / Frosted / White",
        "price": 899,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0843FWT"
      },
      {
        "id": "52759911956612",
        "title": "Medium / Frosted / Dusty Rose",
        "price": 899,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0843FDR"
      },
      {
        "id": "52759936598148",
        "title": "Medium / Prism / Dark Green",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0843PMG"
      },
      {
        "id": "52759938891908",
        "title": "Medium / Prism / Cream",
        "price": 1099,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0843PIG"
      }
    ]
  },
  {
    "id": "6941055877252",
    "handle": "aglaonema-red-plant",
    "title": "Aglaonema Red Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 599,
    "compareAtPrice": 599,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 65,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-227.jpg?v=1788177297",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-227.jpg?v=1788177297",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-228.jpg?v=1788177266",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-231.jpg?v=1788177347",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-232.jpg?v=1788177360",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-234.jpg?v=1788177373",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-236.jpg?v=1788177386",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-237.jpg?v=1788177402",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-238.jpg?v=1788177134",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-240.jpg?v=1788177148",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_20_2026_11_53_14_AM_1.jpg?v=1788184335",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-241.jpg?v=1788177162",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-248.jpg?v=1788177237",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-243.jpg?v=1788177280",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-249.jpg?v=1788177175",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-250.jpg?v=1788177194",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-255.jpg?v=1788177222",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-256.jpg?v=1788177253",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-257.jpg?v=1788177413",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-258.jpg?v=1788177433",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-259.jpg?v=1788177210",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_2.jpg?v=1788184467",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_3.jpg?v=1788184494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_4.jpg?v=1788184513",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_6.jpg?v=1788184529",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_5.jpg?v=1788184543",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_7.jpg?v=1788184555",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_8.jpg?v=1788184572",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_9.jpg?v=1788184586",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_10.jpg?v=1788184601",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Aglonema_red_Artboard_11.jpg?v=1788184615",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-132.jpg?v=1792266316",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-126.jpg?v=1792266298",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-130.jpg?v=1792266291",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-131.jpg?v=1792266270",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_2.jpg?v=1792266235",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_3.jpg?v=1792266222",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_4.jpg?v=1792266208",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_5.jpg?v=1792266194",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_6.jpg?v=1792266176",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_7.jpg?v=1792266164",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_8.jpg?v=1792265277",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_9.jpg?v=1792265262",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Aglaonema_Red_Beauty_10.jpg?v=1792265249"
    ],
    "descriptionHtml": "A great hassle free addition to indoor spaces to lend it colour and charm with its bright red leaves. A lover of indirect to low light areas and little water, this plant is the answer you were looking for to add some character to that empty corner with little light or your work area. Too much green in the plant cluster, add a spot of red and voila!",
    "tags": [
      "air-purifying",
      "flash",
      "limited-stock",
      "low-light",
      "low-maintenance",
      "Plants",
      "retail-store",
      "top-200-sku",
      "trend"
    ],
    "variants": [
      {
        "id": "40859456536708",
        "title": "Medium / GroPot / Mocca",
        "price": 599,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0464"
      },
      {
        "id": "41392082616452",
        "title": "Medium / Krish / Ivory",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0464KIY"
      },
      {
        "id": "41392082649220",
        "title": "Medium / Krish / Red",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0464KRD"
      },
      {
        "id": "41392082747524",
        "title": "Medium / Krish / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0464KWT"
      },
      {
        "id": "52743248380036",
        "title": "Medium / York / White",
        "price": 699,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0464YRW"
      },
      {
        "id": "52743248806020",
        "title": "Medium / York / Mocca",
        "price": 699,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0464YRM"
      },
      {
        "id": "52743248871556",
        "title": "Medium / York / Terracotta",
        "price": 699,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0464YRT"
      },
      {
        "id": "52743262535812",
        "title": "Medium / Grail / White",
        "price": 1049,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0464GWT"
      },
      {
        "id": "41392083468420",
        "title": "Medium / Grail / Peach",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0464GPC"
      },
      {
        "id": "41643663327364",
        "title": "Medium / Prism / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0464PWG"
      },
      {
        "id": "52743267680388",
        "title": "Medium / Prism / Mint",
        "price": 1249,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0464PGM"
      },
      {
        "id": "41643663392900",
        "title": "Medium / Aurelius / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0464AWG"
      },
      {
        "id": "41643663360132",
        "title": "Medium / Aurelius / Grey",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0464AGG"
      },
      {
        "id": "52743270203524",
        "title": "Medium / Aurelius / Mint",
        "price": 1249,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0464AGM"
      },
      {
        "id": "52743295828100",
        "title": "Medium / Roma / White",
        "price": 999,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0464RWT"
      },
      {
        "id": "52743295860868",
        "title": "Medium / Roma / Grey",
        "price": 999,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0464RGY"
      },
      {
        "id": "41570387001476",
        "title": "Large / GroPot / Ivory",
        "price": 1299,
        "compareAtPrice": 1500,
        "available": true,
        "sku": "NUPL0636"
      },
      {
        "id": "41150979637380",
        "title": "Large / Krish / Ivory",
        "price": 1299,
        "compareAtPrice": 1500,
        "available": true,
        "sku": "NUPL0636KIY"
      },
      {
        "id": "41571505438852",
        "title": "Large / Krish / Red",
        "price": 1299,
        "compareAtPrice": 1500,
        "available": true,
        "sku": "NUPL0636KRD"
      },
      {
        "id": "40859456503940",
        "title": "Large / Krish / Yellow",
        "price": 1299,
        "compareAtPrice": 1500,
        "available": true,
        "sku": "NUPL0636KYL"
      },
      {
        "id": "41570387263620",
        "title": "Large / Krish / Light Green",
        "price": 1299,
        "compareAtPrice": 1500,
        "available": true,
        "sku": "NUPL0636KLG"
      },
      {
        "id": "41570387230852",
        "title": "Large / Krish / White",
        "price": 1299,
        "compareAtPrice": 1500,
        "available": true,
        "sku": "NUPL0636KWT"
      },
      {
        "id": "41570387329156",
        "title": "Large / Krish / Brown",
        "price": 1499,
        "compareAtPrice": 1799,
        "available": true,
        "sku": "NUPL0636KBN"
      },
      {
        "id": "52743306084484",
        "title": "Medium / Frosted / White",
        "price": 1049,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0464FWT"
      },
      {
        "id": "52743307198596",
        "title": "Medium / Frosted / Dusty rose",
        "price": 1049,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0464FDR"
      },
      {
        "id": "52743314505860",
        "title": "Medium / Diamond / White",
        "price": 899,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0464DWT"
      },
      {
        "id": "52743323025540",
        "title": "Medium / Prism / Cream",
        "price": 1249,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0464PGC"
      }
    ]
  },
  {
    "id": "6940421881988",
    "handle": "sansevieria-laurentii-plant-xl",
    "title": "Sansevieria Laurentii Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 1799,
    "compareAtPrice": 2300,
    "discountPercent": 22,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 64,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_MBmExKWDCm.jpg?v=1788436347",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_MBmExKWDCm.jpg?v=1788436347",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_2.jpg?v=1790064967",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_3.jpg?v=1790065077",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_4.jpg?v=1790063623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_5.jpg?v=1790065217",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_6.jpg?v=1790063639",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_7.jpg?v=1790063594",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_8.jpg?v=1790064885",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sansevieria_Laurentii_Artboard_10.jpg?v=1790063611"
    ],
    "descriptionHtml": "<!---->",
    "tags": [
      "3500",
      "Drought-Tolerant",
      "flash",
      "morden",
      "retail-store",
      "special",
      "top-200-sku",
      "Vastu-friendly",
      "XL-Plant",
      "XL_birthday"
    ],
    "variants": [
      {
        "id": "40858058883204",
        "title": "Default Title",
        "price": 1799,
        "compareAtPrice": 2300,
        "available": true,
        "sku": "NUPL0597"
      }
    ]
  },
  {
    "id": "6940849766532",
    "handle": "snake-plant-golden-hahnii",
    "title": "Snake Plant - Golden Hahnii",
    "category": "plants",
    "subCategory": "plants",
    "price": 249,
    "compareAtPrice": 249,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 266,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_069b0d20-2c81-4d72-ac58-325546e17439.jpg?v=1769689893",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_069b0d20-2c81-4d72-ac58-325546e17439.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c511bf75-6abb-4915-960b-20d7183ca9f0.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_78f88fcc-8795-4b42-b7bb-cd166db17f96.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_523ce6ab-66ef-438a-add0-b5e0d58b54d0.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_21705a6e-8384-4950-a0eb-26c4a7942f95.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_97f5126c-7bfe-4f2d-b612-b49667fa0ff0.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_52104e94-2a21-4c30-8da6-17e2f633c353.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_5b61e677-af89-492f-98aa-9139470f0e23.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_b4bfd002-26ff-4cc9-95ec-faa56ee450e0.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHDCB1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHDM1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHGCB1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHGM1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHGP1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHGW1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHRCB1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHRM1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGHRP1.jpg?v=1769689893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-690.jpg?v=1785498796",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-695.jpg?v=1785498808",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-696.jpg?v=1785498824",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-698.jpg?v=1785498837",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-699.jpg?v=1785498854",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-701.jpg?v=1785498867",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-702.jpg?v=1785498881",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-704.jpg?v=1785498912",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-703.jpg?v=1785498896",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-705.jpg?v=1785498926",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-713.jpg?v=1785499015",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-712.jpg?v=1785499002",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-711.jpg?v=1785498986",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-716.jpg?v=1785499047",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-715.jpg?v=1785499032",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-718.jpg?v=1785499074",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-717.jpg?v=1785499059",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-719.jpg?v=1785499092",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-02.jpg?v=1785930952",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-03.jpg?v=1785931216",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-04.jpg?v=1785930965",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-05.jpg?v=1785930976",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-06_227dbe9b-9ec8-4137-870f-ae0e488e4ad0.jpg?v=1786355623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-07.jpg?v=1785931014",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-08.jpg?v=1785931036",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-09.jpg?v=1785931049",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Snake_Plant_-_Golden_Hahnii-10.jpg?v=1785931066",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-710_1b511c73-3b53-4b21-af10-b0684a86fab1.jpg?v=1785938215",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-707_1ba64b0b-7562-4ce8-abd5-dfdad282840b.jpg?v=1785938189",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-708_3a12fe58-01d6-4618-b81a-fe7e6ae773fa.jpg?v=1785938203"
    ],
    "descriptionHtml": "A dwarf variety of the famed snake plant family, the Sansevieria Golden Hahnii sports beautiful variegated leaves in grey-green with dark green bands and golden yellow margins. It is a low maintenance plant that is hard to kill even for the most novice of gardeners. Its compact size makes it an excellent choice for office desks and small spaces.",
    "tags": [
      "air-purifying",
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "featured",
      "flash",
      "low-maintenance",
      "on_sale",
      "retail-store",
      "Succulent",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41371887534212",
        "title": "GroPot / Mocca",
        "price": 249,
        "compareAtPrice": 249,
        "available": true,
        "sku": "NUPL0065"
      },
      {
        "id": "41371887730820",
        "title": "Krish / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065KIY"
      },
      {
        "id": "41371887632516",
        "title": "Krish / White",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065KWT"
      },
      {
        "id": "41371887698052",
        "title": "Krish / Brown",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065KBN"
      },
      {
        "id": "51200186515588",
        "title": "Kyoto / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065QMC"
      },
      {
        "id": "51200186220676",
        "title": "Kyoto / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065QIY"
      },
      {
        "id": "51200186843268",
        "title": "Kyoto / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065QTC"
      },
      {
        "id": "51837331144836",
        "title": "Yoda / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065YMC"
      },
      {
        "id": "51837331177604",
        "title": "Yoda / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065YIY"
      },
      {
        "id": "51837331210372",
        "title": "Yoda / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0065YTC"
      },
      {
        "id": "41371887960196",
        "title": "Lagos / Mocca",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0065LMC"
      },
      {
        "id": "41371887927428",
        "title": "Lagos / White",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0065LWT"
      },
      {
        "id": "41371887992964",
        "title": "Lagos / Grey",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0065LGY"
      },
      {
        "id": "41709762576516",
        "title": "Jar / Dusty Rose",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL3280"
      },
      {
        "id": "41709762543748",
        "title": "Jar / Eggshell White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL3279"
      },
      {
        "id": "41709762609284",
        "title": "Jar / Cloud Grey",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL3281"
      },
      {
        "id": "41371888025732",
        "title": "Spiro / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065SWT"
      },
      {
        "id": "41371888058500",
        "title": "Spiro / Pink",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065SPK"
      },
      {
        "id": "41371888091268",
        "title": "Spiro / Black",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065SBK"
      },
      {
        "id": "41371888124036",
        "title": "Spiro / Turquoise",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065STQ"
      },
      {
        "id": "41371888156804",
        "title": "Spiro / Cadet Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0065SCB"
      },
      {
        "id": "41371888189572",
        "title": "Spiro / Sky Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065SSB"
      },
      {
        "id": "41709762445444",
        "title": "Diamond / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0065DWT"
      },
      {
        "id": "51180626935940",
        "title": "Diamond / Magenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065DMJ"
      },
      {
        "id": "51180626968708",
        "title": "Diamond / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065DCB"
      },
      {
        "id": "51180627001476",
        "title": "Diamond / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065DPC"
      },
      {
        "id": "51837331243140",
        "title": "Table Top / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0065TWT"
      },
      {
        "id": "41709762478212",
        "title": "Roma / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065RWT"
      },
      {
        "id": "41709762510980",
        "title": "Roma / Grey",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0065RGR"
      },
      {
        "id": "51180627034244",
        "title": "Roma / Magenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065RMJ"
      },
      {
        "id": "51180627067012",
        "title": "Roma / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065RCB"
      },
      {
        "id": "51180627099780",
        "title": "Roma / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0065RPC"
      },
      {
        "id": "51180613795972",
        "title": "Grail / White",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0065GWT"
      },
      {
        "id": "51180627132548",
        "title": "Grail / Magenta",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0065GMJ"
      },
      {
        "id": "51180627165316",
        "title": "Grail / Carton Brown",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0065GCB"
      },
      {
        "id": "51180627198084",
        "title": "Grail / Peach",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0065GPC"
      }
    ]
  },
  {
    "id": "7046709543044",
    "handle": "zz-plant-xl",
    "title": "ZZ Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 2499,
    "compareAtPrice": 3000,
    "discountPercent": 17,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 183,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_ksw4zF216B.jpg?v=1788436603",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_ksw4zF216B.jpg?v=1788436603",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_2.jpg?v=1790063487",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_3.jpg?v=1790064055",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_4.jpg?v=1790063835",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_5.jpg?v=1790064254",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_6.jpg?v=1790064270",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_7.jpg?v=1790064823",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_8.jpg?v=1790064597",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_Green_dwarf__Artboard_10.jpg?v=1790064041"
    ],
    "descriptionHtml": "Topping the list of indestructible houseplants is the Zamioculcas Zamiifolia more popularly known as the ZZ plant. This plant is loved for his easy going and non-demanding nature. The wide, dark, glossy leaves instantly add life to any interior and he will be a happy trooper in the darkest corners of your home.",
    "tags": [
      "air-purifying",
      "buy2",
      "Easy-care",
      "featured",
      "flash",
      "low-light",
      "low-maintenance",
      "retail-store",
      "top-200-sku",
      "XL-Plant"
    ],
    "variants": [
      {
        "id": "41258621272196",
        "title": "Default Title",
        "price": 2499,
        "compareAtPrice": 3000,
        "available": true,
        "sku": "NUPL0757"
      }
    ]
  },
  {
    "id": "6941007773828",
    "handle": "zz-plant-medium",
    "title": "ZZ Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 499,
    "compareAtPrice": 499,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 189,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_09_00_59_PM.jpg?v=1788359021",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_09_00_59_PM.jpg?v=1788359021",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-148.jpg?v=1788358711",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-152.jpg?v=1788358730",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-154.jpg?v=1788358754",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-164.jpg?v=1788358772",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-176.jpg?v=1788358791",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-178.jpg?v=1788358813",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_03_05_52_PM.jpg?v=1788359007",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_08_24_04_PM.jpg?v=1788358993",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-145.jpg?v=1788358960",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-150.jpg?v=1788358975",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-159.jpg?v=1788358825",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-166.jpg?v=1788359067",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-170.jpg?v=1788359054",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-171.jpg?v=1788359036",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-172.jpg?v=1788358841",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-175.jpg?v=1788358854",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-177.jpg?v=1788358873",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-180.jpg?v=1788358888",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-182.jpg?v=1788358903",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-183.jpg?v=1788358916",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-184.jpg?v=1788358932",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-142.jpg?v=1788358968",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_2.jpg?v=1788364336",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_3.jpg?v=1788364349",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_4.jpg?v=1788364364",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_5.jpg?v=1788364377",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_6.jpg?v=1788364397",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_7.jpg?v=1788364414",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_8.jpg?v=1788364428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_9.jpg?v=1788364440",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_10.jpg?v=1788364458",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Zamia_Artboard_11.jpg?v=1788364471",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/A_image_11_ac99df26-271c-4da2-9efb-e6502d0bc25c.jpg?v=1792223507",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_2.jpg?v=1792223474",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_3.jpg?v=1792223371",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_4.jpg?v=1792223383",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_5.jpg?v=1792223456",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_6.jpg?v=1792223395",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_7.jpg?v=1792223489",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_8.jpg?v=1792223429",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_9.jpg?v=1792223414",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Zamia_zz_10.jpg?v=1792223443"
    ],
    "descriptionHtml": "<ul>\n<li style=\"color: rgb(28, 28, 28);\"><span style=\"color: rgb(28, 28, 28);\">Topping the list of indestructible houseplants is the Zamioculcas Zamiifolia more popularly known as the <strong>ZZ plant.</strong></span></li>\n<li style=\"color: rgb(28, 28, 28);\"><span style=\"color: rgb(28, 28, 28);\">This plant is loved for his <strong>easy going and non-demanding nature.</strong></span></li>\n<li style=\"color: rgb(28, 28, 28);\"><span style=\"color: rgb(28, 28, 28);\"> The wide, dark, glossy leaves instantly add life to any interior and he will be a happy trooper in the darkest corners of your home.</span></li>\n</ul>",
    "tags": [
      "air-purifying",
      "Easy-care",
      "featured",
      "flash",
      "low-light",
      "low-maintenance",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "41370708738180",
        "title": "Medium / GroPot / Ivory",
        "price": 499,
        "compareAtPrice": 499,
        "available": false,
        "sku": "NUPL0345"
      },
      {
        "id": "41370706772100",
        "title": "Medium / Krish / Ivory",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0345KIY"
      },
      {
        "id": "41370707787908",
        "title": "Medium / Krish / Red",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0345KRD"
      },
      {
        "id": "41370707820676",
        "title": "Medium / Krish / Light Green",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0345KLG"
      },
      {
        "id": "41370707853444",
        "title": "Medium / Krish / Yellow",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0345KYL"
      },
      {
        "id": "41371247640708",
        "title": "Medium / Krish / Brown",
        "price": 599,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0345KBN"
      },
      {
        "id": "41622348791940",
        "title": "Medium / Prism / White",
        "price": 1355,
        "compareAtPrice": 2249,
        "available": false,
        "sku": "NUPL0345PWG"
      },
      {
        "id": "41622348857476",
        "title": "Medium / Aurelius / White",
        "price": 999,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0345AWG"
      },
      {
        "id": "41622348824708",
        "title": "Medium / Aurelius / Grey",
        "price": 999,
        "compareAtPrice": 1200,
        "available": false,
        "sku": "NUPL0345AGG"
      },
      {
        "id": "41370727841924",
        "title": "Medium / Grail / Pink",
        "price": 899,
        "compareAtPrice": 1050,
        "available": false,
        "sku": "NUPL0345GPC"
      },
      {
        "id": "41163017945220",
        "title": "Large / Krish / Ivory",
        "price": 1199,
        "compareAtPrice": 1199,
        "available": true,
        "sku": "NUPL0501"
      }
    ]
  },
  {
    "id": "6941025796228",
    "handle": "snake-plant-futura-superba",
    "title": "Snake Plant - Futura Superba",
    "category": "plants",
    "subCategory": "plants",
    "price": 599,
    "compareAtPrice": 499,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 203,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-Black_3702cc89-cd97-4fc6-8149-98923f572a8f.jpg?v=1681552994",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-Black_3702cc89-cd97-4fc6-8149-98923f572a8f.jpg?v=1681552994",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-LightGrey_246073ec-9447-4e28-88a5-785c5300dfcc.jpg?v=1681552994",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-White_09a2b060-da54-45dc-907b-bb795a4157f0.jpg?v=1681552994",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_03_07_20_PM.jpg?v=1788357851",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_08_26_40_PM.jpg?v=1788357834",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_09_03_06_PM.jpg?v=1788357866",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-187_1.jpg?v=1788357795",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-188.jpg?v=1788357807",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-191.jpg?v=1788357776",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-194.jpg?v=1788357823",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-199.jpg?v=1788357555",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-200.jpg?v=1788357569",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-203.jpg?v=1788357582",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-204.jpg?v=1788357598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-206.jpg?v=1788357614",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-209.jpg?v=1788357628",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-211.jpg?v=1788357642",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-213.jpg?v=1788357655",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-214.jpg?v=1788357673",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-217.jpg?v=1788357763",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-218.jpg?v=1788357688",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-220.jpg?v=1788357701",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-221.jpg?v=1788357715",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-222.jpg?v=1788357734",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-223.jpg?v=1788357880",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-224.jpg?v=1788357750",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_2.jpg?v=1788357896",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_3.jpg?v=1788357916",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_4.jpg?v=1788357930",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_5.jpg?v=1788357947",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/WhatsApp_Image_2026-09-08_at_2.32.49_PM_1.jpg?v=1788861134",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_7.jpg?v=1788357977",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_8.jpg?v=1788358001",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_9.jpg?v=1788358051",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Snake-_Futura_superba_Artboard_10.jpg?v=1788358087"
    ],
    "descriptionHtml": "<p><meta charset=\"utf-8\"><b id=\"docs-internal-guid-2744fdcc-7fff-bed1-b0ec-412606aa4313\"><span>Another cousin of the classic Snake Plant, the </span><span>Sansevieria Futura Superba </span><span>is a delight to look at and have indoors with its long, sword-like leaves, dark green patterns on a lighter green backdrop, and golden-yellow borders that adorn the edges of the leaves. As is characteristic of Snake Plants, the Futura Superba is also a wonderfully low maintenance addition to indoor spaces, making it ideal for new and busy gardeners. Moreover, the low light tolerance and forgiving nature of this plant toward small durations of neglect make it a garden favorite. </span></b></p>",
    "tags": [
      "air-purifying",
      "b2g1",
      "buy3",
      "flash",
      "low-light",
      "low-maintenance",
      "retail-store",
      "Succulent",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "40859400372356",
        "title": "GroPot / Mocca",
        "price": 599,
        "compareAtPrice": 499,
        "available": true,
        "sku": "NUPL0393"
      },
      {
        "id": "41391919202436",
        "title": "Krish Pot / Ivory",
        "price": 699,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393KIY"
      },
      {
        "id": "52761185779844",
        "title": "Krish Pot / White",
        "price": 699,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393KWT"
      },
      {
        "id": "52761187352708",
        "title": "Diamond / White",
        "price": 899,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393DWT"
      },
      {
        "id": "52761188204676",
        "title": "Prism / White",
        "price": 1249,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393PWG"
      },
      {
        "id": "52761188499588",
        "title": "Prism / Dark Green",
        "price": 1249,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393PMG"
      },
      {
        "id": "52761188630660",
        "title": "Prism / Cream",
        "price": 1249,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393PSM"
      },
      {
        "id": "52761189154948",
        "title": "Aurelius / White",
        "price": 1249,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393AWG"
      },
      {
        "id": "52761189318788",
        "title": "Aurelius / Grey",
        "price": 1249,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393AGG"
      },
      {
        "id": "52761189482628",
        "title": "Aurelius / Dark Green",
        "price": 1249,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393AMG"
      },
      {
        "id": "52761189613700",
        "title": "Frosted / White",
        "price": 1099,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393FWT"
      },
      {
        "id": "52761189744772",
        "title": "Frosted / Dusty Rose",
        "price": 1099,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393FDR"
      },
      {
        "id": "52761190039684",
        "title": "Roma / White",
        "price": 999,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393RWT"
      },
      {
        "id": "52761190203524",
        "title": "Roma / Grey",
        "price": 999,
        "compareAtPrice": 700,
        "available": false,
        "sku": "NUPL0393RGY"
      },
      {
        "id": "52761190301828",
        "title": "York / White",
        "price": 699,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393YRW"
      },
      {
        "id": "52761190563972",
        "title": "York / Mocca",
        "price": 699,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393YRM"
      },
      {
        "id": "52761191579780",
        "title": "York / Terracotta",
        "price": 699,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393YRT"
      },
      {
        "id": "41391919300740",
        "title": "Krish Pot / Yellow",
        "price": 699,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393KYL"
      },
      {
        "id": "41391919333508",
        "title": "Krish Pot / Brown",
        "price": 699,
        "compareAtPrice": 700,
        "available": true,
        "sku": "NUPL0393KBN"
      },
      {
        "id": "41391919366276",
        "title": "Venice Planter / Light Grey",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0393VLG"
      },
      {
        "id": "41391919399044",
        "title": "Venice Planter / White",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0393VWT"
      },
      {
        "id": "41391919431812",
        "title": "Venice Planter / Black",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0393VBK"
      },
      {
        "id": "41391919464580",
        "title": "Grail Pot / Peach",
        "price": 1099,
        "compareAtPrice": 1050,
        "available": false,
        "sku": "NUPL0393GPC"
      },
      {
        "id": "52761187647620",
        "title": "Grail Pot / White",
        "price": 1099,
        "compareAtPrice": 1050,
        "available": false,
        "sku": "NUPL0393GWT"
      }
    ]
  },
  {
    "id": "6941010296964",
    "handle": "bamboo-palm-plant",
    "title": "Bamboo Palm Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 349,
    "compareAtPrice": 349,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 256,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_5f0e923f-9b06-4dea-a9ab-a4550f013b0a.jpg?v=1759855925",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_5f0e923f-9b06-4dea-a9ab-a4550f013b0a.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_fd05b332-141a-4543-bd40-b4eec05b8cc6.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_d13d5e5c-5f67-4d1c-aab7-35365c347fbe.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_55b76ede-67cf-4779-9787-5e6cd9ec6f29.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_7fa326c7-5438-45e7-9a9c-addaa86d56e6.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_139d9346-efb7-4c8e-a6b6-1940101c218d.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_9bd1a930-9790-4548-b8f8-ea7267795161.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_e67ea6cd-a554-40f0-a11a-9a2bf10274b2.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_9c565887-7548-46e0-a4bc-328da8536d0c.jpg?v=1759855925",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPDCB1.jpg?v=1759918607",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPDM1.jpg?v=1759918607",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPDP1.jpg?v=1759918607",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPGCB1.jpg?v=1759918632",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPGM1.jpg?v=1759918633",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPGP1.jpg?v=1759918632",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPGW1.jpg?v=1759918632",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPRCB1.jpg?v=1759921825",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/BPRM1.jpg?v=1759921825",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-151.jpg?v=1785844481",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-155.jpg?v=1785844495",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-158.jpg?v=1785844513",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-161.jpg?v=1785844421",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-165.jpg?v=1785844435",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-167.jpg?v=1785844454",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-169.jpg?v=1785844527",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-171.jpg?v=1785844556",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-174.jpg?v=1785844574",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-176.jpg?v=1785844541",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-185.jpg?v=1785844661",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-186.jpg?v=1785844646",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-189.jpg?v=1785844692",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-190.jpg?v=1785844674",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-191.jpg?v=1785844468",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-192.jpg?v=1785844706",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-193.jpg?v=1785844722",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-187.jpg?v=1785844633",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-183_607f3254-1e5c-4a36-a63b-c38023ea219b.jpg?v=1785938399",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-178_a144120a-788f-40e5-9cbd-601eeb043ab7.jpg?v=1785938368",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-181_5bad4993-4e85-41fa-9116-ff7530248a3e.jpg?v=1785938383",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_2.jpg?v=1786010155",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_3.jpg?v=1786010177",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_4.jpg?v=1786010250",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_5.jpg?v=1786010238",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_6.jpg?v=1786010144",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_7.jpg?v=1786010267",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_8.jpg?v=1786010190",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_9.jpg?v=1786010217",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_10.jpg?v=1786010129",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Bamboo_Palm_Artboard_11.jpg?v=1786010204",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bamboo_Palm-02_6168c3f5-e5f1-4d98-b31d-09cefad77729.jpg?v=1786607622",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bamboo_Palm-01.jpg?v=1786607607",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bamboo_Palm-03.jpg?v=1786607636",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bamboo_Palm-04.jpg?v=1786607652",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bamboo_Palm-05_2.jpg?v=1786607667",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-109.jpg?v=1788256665",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_08_22_22_PM.jpg?v=1788256735",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_08_58_43_PM.jpg?v=1788256887",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-115.jpg?v=1788256679",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-117.jpg?v=1788256694",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-120.jpg?v=1788256873",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-122.jpg?v=1788256541",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-124.jpg?v=1788256916",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-125.jpg?v=1788256795",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-126.jpg?v=1788256812",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-127.jpg?v=1788256709",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-128.jpg?v=1788256781",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-130.jpg?v=1788256555",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-132.jpg?v=1788256571",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-133.jpg?v=1788256585",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-134.jpg?v=1788256600",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-135.jpg?v=1788256933",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-136.jpg?v=1788256614",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-137.jpg?v=1788256768",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-138.jpg?v=1788256635",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-139.jpg?v=1788256648",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_2.jpg?v=1788285152",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_3.jpg?v=1788285165",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_4.jpg?v=1788285180",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_5.jpg?v=1788285197",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_6.jpg?v=1788285137",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_7.jpg?v=1788285211",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_8.jpg?v=1788285224",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_9.jpg?v=1788285239",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_10.jpg?v=1788285257",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Bamboo_Palm_Artboard_11.jpg?v=1788285274"
    ],
    "descriptionHtml": "<p>Its lush green foliage swaying daintily in the breeze is sure to remind you of tropical resorts. The stunning green leaves grow directly from the stem and over time the spread of the plant increases to fill up the pot. An excellent air purifier the bamboo palm is easy to grow and maintain, it makes a great centerpiece in a quirky pot.</p>",
    "tags": [
      "air-purifying",
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "flash",
      "low-maintenance",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41370752712836",
        "title": "Small / GroPot / Mocca",
        "price": 349,
        "compareAtPrice": 349,
        "available": true,
        "sku": "NUPL0368"
      },
      {
        "id": "41370752024708",
        "title": "Small / Krish / Ivory",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368KIY"
      },
      {
        "id": "41370751795332",
        "title": "Small / Krish / White",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368KWT"
      },
      {
        "id": "41370752090244",
        "title": "Small / Krish / Brown",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368KBN"
      },
      {
        "id": "51833571737732",
        "title": "Small / Yoda / Mocca",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368YMC"
      },
      {
        "id": "51833571770500",
        "title": "Small / Yoda / Ivory",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368YIY"
      },
      {
        "id": "51833571803268",
        "title": "Small / Yoda / Terracotta",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368YTC"
      },
      {
        "id": "51200145981572",
        "title": "Small / Kyoto / Mocca",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368QMC"
      },
      {
        "id": "51200145948804",
        "title": "Small / Kyoto / Ivory",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368QIY"
      },
      {
        "id": "51200146014340",
        "title": "Small / Kyoto / Terracotta",
        "price": 399,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL0368QTC"
      },
      {
        "id": "41370746388612",
        "title": "Small / Lagos / Mocca",
        "price": 449,
        "compareAtPrice": 500,
        "available": true,
        "sku": "NUPL0368LMC"
      },
      {
        "id": "41370751664260",
        "title": "Small / Lagos / White",
        "price": 449,
        "compareAtPrice": 500,
        "available": true,
        "sku": "NUPL0368LWT"
      },
      {
        "id": "41370751697028",
        "title": "Small / Lagos / Grey",
        "price": 449,
        "compareAtPrice": 500,
        "available": true,
        "sku": "NUPL0368LGY"
      },
      {
        "id": "41577436151940",
        "title": "Small / Jar / Dusty Rose",
        "price": 449,
        "compareAtPrice": 550,
        "available": false,
        "sku": "NUPL0368JDR"
      },
      {
        "id": "41577436184708",
        "title": "Small / Jar / Cloud Grey",
        "price": 449,
        "compareAtPrice": 550,
        "available": true,
        "sku": "NUPL0368JCG"
      },
      {
        "id": "41577436217476",
        "title": "Small / Jar / Eggshell White",
        "price": 449,
        "compareAtPrice": 550,
        "available": false,
        "sku": "NUPL0368JEW"
      },
      {
        "id": "41577436250244",
        "title": "Small / Diamond / White",
        "price": 649,
        "compareAtPrice": 750,
        "available": true,
        "sku": "NUPL0368DWT"
      },
      {
        "id": "51182425636996",
        "title": "Small / Diamond / Peach",
        "price": 649,
        "compareAtPrice": 750,
        "available": false,
        "sku": "NUPL0368DPC"
      },
      {
        "id": "51182425669764",
        "title": "Small / Diamond / Magenta",
        "price": 649,
        "compareAtPrice": 750,
        "available": false,
        "sku": "NUPL0368DMJ"
      },
      {
        "id": "51182425702532",
        "title": "Small / Diamond / Carton Brown",
        "price": 649,
        "compareAtPrice": 750,
        "available": false,
        "sku": "NUPL0368DCB"
      },
      {
        "id": "51833572098180",
        "title": "Small / Table Top / White",
        "price": 649,
        "compareAtPrice": 750,
        "available": true,
        "sku": "NUPL0368TWT"
      },
      {
        "id": "51182425735300",
        "title": "Small / Grail / White",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0368GWT"
      },
      {
        "id": "51182425768068",
        "title": "Small / Grail / Peach",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0368GPC"
      },
      {
        "id": "51182425800836",
        "title": "Small / Grail / Magenta",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0368GMJ"
      },
      {
        "id": "51182425833604",
        "title": "Small / Grail / Carton Brown",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0368GCB"
      },
      {
        "id": "41577523413124",
        "title": "Small / Roma / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": false,
        "sku": "NUPL0368RWT"
      },
      {
        "id": "51182425538692",
        "title": "Small / Roma / Peach",
        "price": 699,
        "compareAtPrice": 800,
        "available": false,
        "sku": "NUPL0368RPC"
      },
      {
        "id": "51182425571460",
        "title": "Small / Roma / Magenta",
        "price": 699,
        "compareAtPrice": 800,
        "available": false,
        "sku": "NUPL0368RMJ"
      },
      {
        "id": "51182425604228",
        "title": "Small / Roma / Carton Brown",
        "price": 699,
        "compareAtPrice": 800,
        "available": false,
        "sku": "NUPL0368RCB"
      },
      {
        "id": "51182431993988",
        "title": "Small / Roma / Gray",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0368RGY"
      },
      {
        "id": "41370751828100",
        "title": "Small / Spiro / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": false,
        "sku": "NUPL0368SWT"
      },
      {
        "id": "41370751860868",
        "title": "Small / Spiro / Black",
        "price": 699,
        "compareAtPrice": 800,
        "available": false,
        "sku": "NUPL0368SBK"
      },
      {
        "id": "41370751991940",
        "title": "Small / Spiro / Pink",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0368SPK"
      },
      {
        "id": "41370751893636",
        "title": "Small / Spiro / Turquoise Blue",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0368STQ"
      },
      {
        "id": "41370751926404",
        "title": "Small / Spiro / Cadet Blue",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0368SCB"
      },
      {
        "id": "41370751959172",
        "title": "Small / Spiro / Sky Blue",
        "price": 699,
        "compareAtPrice": 800,
        "available": false,
        "sku": "NUPL0368SSB"
      },
      {
        "id": "41459348537476",
        "title": "Medium / GroPot / Mocca",
        "price": 599,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0849"
      },
      {
        "id": "41459348832388",
        "title": "Medium / Krish / Ivory",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0849KIY"
      },
      {
        "id": "41459348897924",
        "title": "Medium / Krish / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0849KWT"
      },
      {
        "id": "41459348996228",
        "title": "Medium / Krish / Brown",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0849KBN"
      },
      {
        "id": "41459348930692",
        "title": "Medium / Krish / Light Green",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0849KLG"
      },
      {
        "id": "52749912965252",
        "title": "Medium / York / Mocca",
        "price": 699,
        "compareAtPrice": 349,
        "available": true,
        "sku": "NUPL0849YRM"
      },
      {
        "id": "52749898907780",
        "title": "Medium / York / White",
        "price": 699,
        "compareAtPrice": 349,
        "available": true,
        "sku": "NUPL0849YRW"
      },
      {
        "id": "52749907853444",
        "title": "Medium / York / Terracotta",
        "price": 699,
        "compareAtPrice": 349,
        "available": true,
        "sku": "NUPL0849YRT"
      },
      {
        "id": "52750040694916",
        "title": "Medium / Diamond / White",
        "price": 899,
        "compareAtPrice": 349,
        "available": false,
        "sku": "NUPL0849DWT"
      },
      {
        "id": "52749958086788",
        "title": "Medium / Frosted / White",
        "price": 1049,
        "compareAtPrice": 349,
        "available": false,
        "sku": "NUPL0849FWT"
      },
      {
        "id": "52749962608772",
        "title": "Medium / Frosted / Dusty rose",
        "price": 1049,
        "compareAtPrice": 349,
        "available": true,
        "sku": "NUPL0849FDR"
      },
      {
        "id": "52749933609092",
        "title": "Medium / Grail / White",
        "price": 1049,
        "compareAtPrice": 349,
        "available": false,
        "sku": "NUPL0849GWT"
      },
      {
        "id": "41459348668548",
        "title": "Medium / Grail / Peach",
        "price": 1049,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0849GPC"
      },
      {
        "id": "52750024933508",
        "title": "Medium / Roma / White",
        "price": 999,
        "compareAtPrice": 349,
        "available": false,
        "sku": "NUPL0849RWT"
      },
      {
        "id": "52750035583108",
        "title": "Medium / Roma / Grey",
        "price": 999,
        "compareAtPrice": 349,
        "available": false,
        "sku": "NUPL0849RGY"
      },
      {
        "id": "41616520708228",
        "title": "Medium / Prism / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": true,
        "sku": "NUPL0849PWT"
      },
      {
        "id": "41616520675460",
        "title": "Medium / Prism / Cream",
        "price": 1249,
        "compareAtPrice": 2249,
        "available": false,
        "sku": "NUPL0849PIG"
      },
      {
        "id": "52749946290308",
        "title": "Medium / Prism / Mint",
        "price": 1249,
        "compareAtPrice": 349,
        "available": false,
        "sku": "NUPL0849PMG"
      },
      {
        "id": "41616520773764",
        "title": "Medium / Aurelius / White",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0849AWT"
      },
      {
        "id": "41616520740996",
        "title": "Medium / Aurelius / Grey",
        "price": 1249,
        "compareAtPrice": 1300,
        "available": false,
        "sku": "NUPL0849AGG"
      },
      {
        "id": "52749921353860",
        "title": "Medium / Aurelius / Mint",
        "price": 1249,
        "compareAtPrice": 349,
        "available": false,
        "sku": "NUPL0849AMG"
      }
    ]
  },
  {
    "id": "6940973629572",
    "handle": "ficus-bonsai-plant",
    "title": "Ficus Bonsai Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 749,
    "compareAtPrice": 850,
    "discountPercent": 12,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 199,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_375f29d7-0539-4206-8d69-722e9e43ede0.jpg?v=1755606972",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_375f29d7-0539-4206-8d69-722e9e43ede0.jpg?v=1755606972",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-20.jpg?v=1788522840",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sizemeup-3.jpg?v=1769690193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_e02c6ee5-a101-4a0c-855e-db477357ef74.jpg?v=1769690193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_9dbd923d-ba39-4392-8c52-b5175fec7f48.jpg?v=1769690193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_17e2d2e6-9561-4041-afb9-72e97177b79e.jpg?v=1769690193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_cd2397be-6958-42c6-92f7-2b2db266d0b1.jpg?v=1769690193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_e3e408fa-a9cb-49b2-8383-0a27a30b2358.jpg?v=1769690193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-260.jpg?v=1788357495",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-261.jpg?v=1788357519",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-264.jpg?v=1788357506",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ChatGPT_Image_Aug_19_2026_09_07_52_PM.jpg?v=1788357534",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-266.jpg?v=1788358436",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-274.jpg?v=1788358466",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-267.jpg?v=1788358481",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-290.jpg?v=1788358494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-291.jpg?v=1788358512",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-284.jpg?v=1788358529",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-286.jpg?v=1788358540",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-285.jpg?v=1788358553",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-287.jpg?v=1788358572",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-288.jpg?v=1788358606",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-289.jpg?v=1788358600",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-294.jpg?v=1788358613",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-295.jpg?v=1788358632",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-293.jpg?v=1788358669",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-292.jpg?v=1788358651",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-296.jpg?v=1788358693",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_2.jpg?v=1788422157",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_3.jpg?v=1788422173",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_4.jpg?v=1788422188",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_5.jpg?v=1788422202",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_6.jpg?v=1788422217",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_7.jpg?v=1788422237",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_8.jpg?v=1788422251",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_9.jpg?v=1788422267",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Ficus_Bonsai_Artboard_10.jpg?v=1788422280"
    ],
    "descriptionHtml": "The Ficus Bonsai, commonly known as the Weeping Fig or Ficus Tree is a beautiful houseplant which is loved by numerous plant parents. It has a unique curved trunk with dark green, oval leaves making it a brilliant centre piece for your living room or side table. Plant them in shallow but wide pots to show off its magnificent stem and roots.",
    "tags": [
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "featured",
      "flash",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "52754053431428",
        "title": "GroPot / Mocca",
        "price": 749,
        "compareAtPrice": 850,
        "available": true,
        "sku": "NUPL0331"
      },
      {
        "id": "41888282673284",
        "title": "Krish / White",
        "price": 749,
        "compareAtPrice": 850,
        "available": true,
        "sku": "NUPL0331KWT"
      },
      {
        "id": "52758215786628",
        "title": "Krish / Ivory",
        "price": 749,
        "compareAtPrice": 850,
        "available": true,
        "sku": "NUPL0331KIY"
      },
      {
        "id": "52758215819396",
        "title": "Krish / Brown",
        "price": 749,
        "compareAtPrice": 850,
        "available": true,
        "sku": "NUPL0331KBN"
      },
      {
        "id": "52758259728516",
        "title": "York / Mocca",
        "price": 749,
        "compareAtPrice": 850,
        "available": true,
        "sku": "NUPL0331YRM"
      },
      {
        "id": "52758181150852",
        "title": "York / White",
        "price": 749,
        "compareAtPrice": 850,
        "available": true,
        "sku": "NUPL0331YRW"
      },
      {
        "id": "52758216638596",
        "title": "York / Terracotta",
        "price": 749,
        "compareAtPrice": 850,
        "available": true,
        "sku": "NUPL0331YRT"
      },
      {
        "id": "52758181183620",
        "title": "Diamond / White",
        "price": 999,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0331DWT"
      },
      {
        "id": "52758181281924",
        "title": "Roma / White",
        "price": 1099,
        "compareAtPrice": 1199,
        "available": false,
        "sku": "NUPL0331RWT"
      },
      {
        "id": "52758217719940",
        "title": "Roma / Grey",
        "price": 1099,
        "compareAtPrice": 1199,
        "available": false,
        "sku": "NUPL0331RGY"
      },
      {
        "id": "41887314903172",
        "title": "ARA / White",
        "price": 999,
        "compareAtPrice": 1199,
        "available": true,
        "sku": "NUPL0961"
      },
      {
        "id": "52758181216388",
        "title": "Frosted / White",
        "price": 1199,
        "compareAtPrice": 1299,
        "available": false,
        "sku": "NUPL0331FWT"
      },
      {
        "id": "52758217228420",
        "title": "Frosted / Dusty Rose",
        "price": 1199,
        "compareAtPrice": 1299,
        "available": true,
        "sku": "NUPL0331FDR"
      },
      {
        "id": "52758181249156",
        "title": "Grail / White",
        "price": 1199,
        "compareAtPrice": 1299,
        "available": false,
        "sku": "NUPL0331GWT"
      },
      {
        "id": "52758217556100",
        "title": "Grail / Peach",
        "price": 1199,
        "compareAtPrice": 1299,
        "available": false,
        "sku": "NUPL0331GPC"
      },
      {
        "id": "52758181347460",
        "title": "Aurelius / White",
        "price": 1299,
        "compareAtPrice": 1399,
        "available": false,
        "sku": "NUPL0331AWG"
      },
      {
        "id": "52758218244228",
        "title": "Aurelius / Grey",
        "price": 1299,
        "compareAtPrice": 1399,
        "available": false,
        "sku": "NUPL0331AGG"
      },
      {
        "id": "52758218309764",
        "title": "Aurelius / Dark Green",
        "price": 1299,
        "compareAtPrice": 1399,
        "available": false,
        "sku": "NUPL0331AMG"
      },
      {
        "id": "52758181314692",
        "title": "Prism / White",
        "price": 1299,
        "compareAtPrice": 1399,
        "available": true,
        "sku": "NUPL0331DWG"
      },
      {
        "id": "52758217982084",
        "title": "Prism / Dark Green",
        "price": 1299,
        "compareAtPrice": 1399,
        "available": true,
        "sku": "NUPL0331PMG"
      },
      {
        "id": "52758218113156",
        "title": "Prism / Cream",
        "price": 1299,
        "compareAtPrice": 1399,
        "available": false,
        "sku": "NUPL0331PCG"
      }
    ]
  },
  {
    "id": "7115658297476",
    "handle": "dieffenbachia-tropic-snow-plant-xl",
    "title": "Dieffenbachia Tropic Snow Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 2299,
    "compareAtPrice": 2999,
    "discountPercent": 23,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 294,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_bxSDYE35Y2.jpg?v=1788436531",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_bxSDYE35Y2.jpg?v=1788436531",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_2.jpg?v=1790064838",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_3.jpg?v=1790064401",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_4.jpg?v=1790064494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_5.jpg?v=1790064477",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_6.jpg?v=1790064436",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_7.jpg?v=1790064416",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_8.jpg?v=1790064449",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Dieffenbachia_Tropic_Snow_Artboard_10.jpg?v=1790064461"
    ],
    "descriptionHtml": "<style type=\"text/css\"><!--\ntd {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}\n--></style>\n<span data-sheets-userformat='{\"2\":15105,\"3\":{\"1\":0},\"11\":4,\"12\":0,\"14\":{\"1\":3,\"3\":1},\"15\":\"Arial\",\"16\":10}' data-sheets-value=\"{&quot;1&quot;:2,&quot;2&quot;:&quot;The Dieffenbachia 'Tropic Snow' is more famously known as the Dumb Cane or Leopard lily. Botanically named Dieffenbachia seguine, it is one of the easiest to care for indoor plants and adds a spot of green to almost any corner of your home. The dumb cane is an easy to grow, large leaved, variegated plant that grows in all light conditions from direct light to medium light. The Dieffenbachia requires very little care and likes to be left aone with ocassional watering when the top soil is dry. It is an excellent plant if you are a new gardener or someone who does not have a lot of time to garden. This large leaved plant has beautiful snow white variegations in the centre with stunnng bright green edges. Get the dirffenbechia home for a forever green corner.&quot;}\">The Dieffenbachia 'Tropic Snow' is more famously known as the Dumb Cane or Leopard lily. Botanically named Dieffenbachia seguine, it is one of the easiest to care for indoor plants and adds a spot of green to almost any corner of your home. The dumb cane is an easy to grow, large leaved, variegated plant that grows in all light conditions from direct light to medium light. The Dieffenbachia requires very little care and likes to be left aone with ocassional watering when the top soil is dry. It is an excellent plant if you are a new gardener or someone who does not have a lot of time to garden. This large leaved plant has beautiful snow white variegations in the centre with stunnng bright green edges. Get the dirffenbechia home for a forever green corner.</span><quillbot-extension-portal></quillbot-extension-portal>",
    "tags": [
      "low-maintenance",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "41433708691588",
        "title": "Default Title",
        "price": 2299,
        "compareAtPrice": 2999,
        "available": true,
        "sku": "NUPL0822"
      }
    ]
  },
  {
    "id": "7050598908036",
    "handle": "ficus-moclame-plant-xl",
    "title": "Ficus Moclame Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 2299,
    "compareAtPrice": 5999,
    "discountPercent": 62,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 59,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_VXtCrjwMMU.jpg?v=1788436516",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-img1_VXtCrjwMMU.jpg?v=1788436516",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_2.jpg?v=1790063849",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_3.jpg?v=1790063877",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_4.jpg?v=1790065559",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_5.jpg?v=1790063923",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_6.jpg?v=1790063938",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_7.jpg?v=1790063895",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_8.jpg?v=1790063862",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Ficus_Moclame_Artboard_10.jpg?v=1790063909"
    ],
    "descriptionHtml": "<style type=\"text/css\" data-mce-fragment=\"1\"><!--\ntd {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}\n--></style>\n<p><span data-sheets-value='{\"1\":2,\"2\":\"The Ficus Moclame (Ficus Microcarpa) is an evergreen indoor plant from the fig family native to Southern Asia. Also, famous as Indian Laurel, Pot Belly Fig, Chinese Banyan, Malayan Banyan, and Curtain Fig. While in the wild, Ficus Moclame can grow into 50 feet tall trees, indoors they only grow to six feet. \\nFamous for their thick round leaves with glossy finish that distinguishes it from its more famous cousins like the weeping fig and the fiddle-leaf fig. The moclame plant needs partial to bright indirect light and can be placed near a south or west facing window for large impressive foliage.\\n\"}' data-sheets-userformat='{\"2\":15105,\"3\":{\"1\":0},\"11\":4,\"12\":0,\"14\":{\"1\":3,\"3\":1},\"15\":\"Arial\",\"16\":10}' data-mce-fragment=\"1\">The Ficus Moclame (Ficus Microcarpa) is an evergreen indoor plant from the fig family native to Southern Asia. Also, famous as Indian Laurel, Pot Belly Fig, Chinese Banyan, Malayan Banyan, and Curtain Fig. While in the wild, Ficus Moclame can grow into 50 feet tall trees, indoors they only grow to six feet. <br data-mce-fragment=\"1\">Famous for their thick round leaves with glossy finish that distinguishes it from its more famous cousins like the weeping fig and the fiddle-leaf fig. The moclame plant needs partial to bright indirect light and can be placed near a south or west facing window for large impressive foliage.<br data-mce-fragment=\"1\"></span></p>",
    "tags": [
      "3500",
      "morden",
      "retail-store",
      "special",
      "top-200-sku",
      "Versatile",
      "XL-Plant",
      "XL_birthday"
    ],
    "variants": [
      {
        "id": "41268065894532",
        "title": "Default Title",
        "price": 2299,
        "compareAtPrice": 5999,
        "available": true,
        "sku": "NUPL0767"
      }
    ]
  },
  {
    "id": "10168071094404",
    "handle": "maximum-oxygen-filter-kit",
    "title": "Set of 6 Easy Care Indoor Plants",
    "category": "plants",
    "subCategory": "plants",
    "price": 999,
    "compareAtPrice": 1799,
    "discountPercent": 44,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 154,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_3ac6ec86-3765-4a74-bc33-9e713eb5eb35.jpg?v=1765219019",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_3ac6ec86-3765-4a74-bc33-9e713eb5eb35.jpg?v=1765219019",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_a418bc32-72cd-46c3-865e-0211baf3ab10.jpg?v=1765224218",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_64cb5845-2fb9-4505-937f-5f01f26e65ca.jpg?v=1765219018",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_598a0686-d1e2-4483-82f0-ae27689c3538.jpg?v=1765219018",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_8f416d1c-33e1-41fc-9241-d98b73ae0f28.jpg?v=1765224220",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_3e102041-0f40-4bc1-8c64-35428af0d71d.jpg?v=1765219018",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_4dec7900-27ff-46c7-9092-bc0a29d44a2f.jpg?v=1765224220",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/8_c491d74e-07c7-4e31-adc0-c25c27b9d2a0.jpg?v=1765224222",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/9_6f862aa3-f896-4b06-92ea-2c7a5c173f81.jpg?v=1765224223",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/10_be08c893-8c47-439d-8000-1fe2eb3686d1.jpg?v=1765224223",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/11_b5482e4c-5a7a-4a41-9377-573530478e04.jpg?v=1765224223",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/12_03dcc972-d788-41d3-a3b5-e82dcbf11bbd.jpg?v=1765224224",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/13_348838db-3771-4354-b2e2-0f12a92586cb.jpg?v=1765224224",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Plant_Bundles-32.jpg?v=1765219018"
    ],
    "descriptionHtml": "<p><spangoogle data-sheets-root=\"1\" sans=\"\">Set of 6 Air Purifier Plant Bundle</spangoogle>Set of 6 Easy Care Indoor Plants :<br>1. <span data-sheets-root=\"1\">Snake Plant- Golden</span><br>2. <span data-sheets-root=\"1\">Syngonium White Butterfly</span><br>3. <span data-sheets-root=\"1\">Chlorophytum Spider Plant</span><br>4. <span data-sheets-root=\"1\">Philodendron Oxycardium Green</span><br>5. <span data-sheets-root=\"1\">Philodendron Brasil</span><br>6. <span data-sheets-root=\"1\">Money Plant Golden</span></p>\n<ul>\n<li><span data-sheets-root=\"1\">The best high-oxygen indoor plants for maximum air purification.</span></li>\n<li>This natural home air filter pack includes 6 NASA-recommended species for cleaner, healthier living spaces.</li>\n</ul>",
    "tags": [
      "air-purifying",
      "Birthday",
      "flash",
      "sale-price",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "51299810246788",
        "title": "Default Title",
        "price": 999,
        "compareAtPrice": 1799,
        "available": true,
        "sku": "NUPLB107"
      }
    ]
  },
  {
    "id": "6941115613316",
    "handle": "peacock-plant",
    "title": "Peacock Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 599,
    "compareAtPrice": 599,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 58,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-LightGrey_4f74ac2e-16ff-496e-98a5-3850cbd61678.jpg?v=1755586733",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-LightGrey_4f74ac2e-16ff-496e-98a5-3850cbd61678.jpg?v=1755586733",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-12.jpg?v=1788522737",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-White_94684fcc-5552-44b8-a77f-16473acf926e.jpg?v=1755586733",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/GroPot_286f04fd-bc6e-4e1c-8898-0abcbf875316.jpg?v=1755586733",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-Black_e475814b-77ab-468b-82e5-73ab1220d007.jpg?v=1755586733",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/GrailCeramicPot-Peach_150b6c1e-8e69-4bc3-a5bf-268a62e37895.jpg?v=1755586733",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Krish12Planter-Ivory_af2d9f9f-e64e-4425-8c31-4598f5bf0368.jpg?v=1755586733",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-793.jpg?v=1788350679",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-794.jpg?v=1788350695",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-796.jpg?v=1788350714",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-797.jpg?v=1788350728",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-800.jpg?v=1788350742",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-803.jpg?v=1788350756",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-805.jpg?v=1788350775",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-807.jpg?v=1788350801",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-811.jpg?v=1788350806",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-812.jpg?v=1788351026",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-813.jpg?v=1788351012",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-815.jpg?v=1788350818",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-816.jpg?v=1788350834",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-817.jpg?v=1788350993",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-818.jpg?v=1788351041",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-819.jpg?v=1788350848",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-822.jpg?v=1788350864",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-823.jpg?v=1788350878",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-824.jpg?v=1788350892",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-825.jpg?v=1788350906",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-828.jpg?v=1788350920",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-829.jpg?v=1788350934",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-792.jpg?v=1788350970",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_2.jpg?v=1788357294",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_4.jpg?v=1788357223",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_3.jpg?v=1788357133",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_5.jpg?v=1788357147",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_6.jpg?v=1788357193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_7.jpg?v=1788357251",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_8.jpg?v=1788357161",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_9.jpg?v=1788357174",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_10.jpg?v=1788357313",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Peacock_plant_Artboard_11.jpg?v=1788357237"
    ],
    "descriptionHtml": "<p><meta charset=\"utf-8\">Scientifically called the Calathea makoyana, the Peacock plant is a stunning indoor plant with patterned leaves that resemble the delicate feathers of a peacock. These eye-catching variegations come in a variety of hues ranging from green, pink, cream, white, and gray, a quality that greatly adds to its allure along with its pet-friendly nature.</p>",
    "tags": [
      "flash",
      "low-light",
      "pet-friendly",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "41187565535364",
        "title": "Medium / GroPot / Ivory",
        "price": 599,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453"
      },
      {
        "id": "41391988342916",
        "title": "Medium / Krish Pot / Ivory",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0453KIY"
      },
      {
        "id": "52761162350724",
        "title": "Medium / Krish Pot / White",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0453KWT"
      },
      {
        "id": "41391988473988",
        "title": "Medium / Krish Pot / Brown",
        "price": 699,
        "compareAtPrice": 800,
        "available": true,
        "sku": "NUPL0453KBN"
      },
      {
        "id": "41391988801668",
        "title": "Medium / Venice Planter / Light Grey",
        "price": 999,
        "compareAtPrice": 1299,
        "available": false,
        "sku": "NUPL0453VLG"
      },
      {
        "id": "41391988834436",
        "title": "Medium / Venice Planter / White",
        "price": 999,
        "compareAtPrice": 1299,
        "available": false,
        "sku": "NUPL0453VWT"
      },
      {
        "id": "41391988867204",
        "title": "Medium / Venice Planter / Black",
        "price": 999,
        "compareAtPrice": 1299,
        "available": false,
        "sku": "NUPL0453VBK"
      },
      {
        "id": "41391989194884",
        "title": "Medium / Grail Pot / Peach",
        "price": 1099,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0453GPC"
      },
      {
        "id": "52761161728132",
        "title": "Medium / Grail Pot / White",
        "price": 1099,
        "compareAtPrice": 1150,
        "available": false,
        "sku": "NUPL0453GWT"
      },
      {
        "id": "52761039962244",
        "title": "Medium / York / White",
        "price": 699,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453YRW"
      },
      {
        "id": "52761052283012",
        "title": "Medium / Roma / White",
        "price": 999,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0453RWT"
      },
      {
        "id": "52761058934916",
        "title": "Medium / Roma / Grey",
        "price": 999,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0453RGY"
      },
      {
        "id": "52761076400260",
        "title": "Medium / Frosted / White",
        "price": 1099,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0453FWT"
      },
      {
        "id": "52761076433028",
        "title": "Medium / Frosted / Dusty Rose",
        "price": 1099,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453FDR"
      },
      {
        "id": "52761082232964",
        "title": "Medium / Aurelius / White",
        "price": 1299,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453AWG"
      },
      {
        "id": "52761083216004",
        "title": "Medium / Aurelius / Grey",
        "price": 1299,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0453AGG"
      },
      {
        "id": "52761084592260",
        "title": "Medium / Aurelius / Dark Green",
        "price": 1299,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0453AMG"
      },
      {
        "id": "52761161334916",
        "title": "Medium / Prism / White",
        "price": 1299,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453PSW"
      },
      {
        "id": "52761161498756",
        "title": "Medium / Prism / Dark Green",
        "price": 1299,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453PMG"
      },
      {
        "id": "52761161564292",
        "title": "Medium / Prism / Cream",
        "price": 1299,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0453PCG"
      },
      {
        "id": "52761162121348",
        "title": "Medium / Diamond / White",
        "price": 899,
        "compareAtPrice": 599,
        "available": false,
        "sku": "NUPL0453DWT"
      },
      {
        "id": "52761040060548",
        "title": "Medium / York / Mocca",
        "price": 699,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453YRM"
      },
      {
        "id": "52761040093316",
        "title": "Medium / York / Terracotta",
        "price": 699,
        "compareAtPrice": 599,
        "available": true,
        "sku": "NUPL0453YRT"
      }
    ]
  },
  {
    "id": "6941041098884",
    "handle": "monstera-deliciosa-plant",
    "title": "Monstera Deliciosa Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 1259,
    "compareAtPrice": 1849,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 136,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-185.jpg?v=1792223718",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-185.jpg?v=1792223718",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-189_ceff3268-549c-4157-8cc2-ae3064e0befb.jpg?v=1792223735",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-187.jpg?v=1792223704",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-191.jpg?v=1792223691",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-193.jpg?v=1792223675",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_2.jpg?v=1792223753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_3.jpg?v=1792223774",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Monstera_Deliciosa_4.jpg?v=1792223790",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_5.jpg?v=1792223803",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_6.jpg?v=1792223816",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_7.jpg?v=1792223835",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_8.jpg?v=1792223851",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_9.jpg?v=1792223863",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/MonsteraDeliciosa_10.jpg?v=1792223877"
    ],
    "descriptionHtml": "<p><meta charset=\"utf-8\">Also called the Swiss Cheese Plant, the Monstera Deliciosa is a tropical stunner brought indoors. With large leaves and wonderful fenestrations that resemble a Swiss cheese slice, this plant has easily become one of the crowd-favorites. If you’re looking for an indoor plant that will effortlessly and instantly uplift your home decor, the Monstera Plant should be your go-to!</p>",
    "tags": [
      "3500",
      "at1999",
      "Birthday_plants",
      "flash",
      "morden",
      "special",
      "Stress-reducer",
      "top-200-sku",
      "XL-Plant",
      "XL_birthday"
    ],
    "variants": [
      {
        "id": "67699988856964",
        "title": "GroPot / Ivory",
        "price": 1259,
        "compareAtPrice": 1849,
        "available": false,
        "sku": ""
      },
      {
        "id": "41697840857220",
        "title": "Krish / Ivory",
        "price": 1259,
        "compareAtPrice": 1849,
        "available": true,
        "sku": "NUPL3100"
      },
      {
        "id": "67699977584772",
        "title": "Krish / White",
        "price": 1259,
        "compareAtPrice": 1849,
        "available": false,
        "sku": ""
      },
      {
        "id": "67699977617540",
        "title": "Krish / Yellow",
        "price": 1259,
        "compareAtPrice": 1849,
        "available": false,
        "sku": ""
      },
      {
        "id": "67699977650308",
        "title": "Krish / Brown",
        "price": 1259,
        "compareAtPrice": 1849,
        "available": false,
        "sku": ""
      }
    ]
  },
  {
    "id": "7180054659204",
    "handle": "zz-black-plant-xl",
    "title": "ZZ Black Plant - XL",
    "category": "plants",
    "subCategory": "plants",
    "price": 2499,
    "compareAtPrice": 3000,
    "discountPercent": 17,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 81,
    "inStock": false,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-as-i_P3G08XJ42C.jpg?v=1788436437",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_transform-this-image-as-i_P3G08XJ42C.jpg?v=1788436437",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/JackieA_image.jpg8_2.jpg?v=1788522931",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_2.jpg?v=1790063503",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_3.jpg?v=1790065542",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_4.jpg?v=1790064863",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_5.jpg?v=1790063515",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_6.jpg?v=1790064343",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_7.jpg?v=1790064195",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_8.jpg?v=1790063474",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/zz_black_Artboard_10.jpg?v=1790064238"
    ],
    "descriptionHtml": "<span>After its grand debut on the global gardening scene in 2019, the Black ZZ is at the top of the list for many plant parents. A variety of the famous green ZZ, this plant has the darkest purple, almost black leaves, and is one of the easiest plants to care for, it can live happily in the lowest light and is extremely drought resistant. To top it off, it's an excellent air.</span>",
    "tags": [
      "air-purifying",
      "buy2",
      "featured",
      "low-light",
      "low-maintenance",
      "price-drop",
      "retail-store",
      "top-200-sku",
      "XL-Plant"
    ],
    "variants": [
      {
        "id": "41616588800132",
        "title": "Default Title",
        "price": 2499,
        "compareAtPrice": 3000,
        "available": false,
        "sku": "NUPL0815"
      }
    ]
  },
  {
    "id": "6940959539332",
    "handle": "fittonia-green-plant-nerve-plant",
    "title": "Fittonia Green Plant (Nerve Plant)",
    "category": "plants",
    "subCategory": "plants",
    "price": 249,
    "compareAtPrice": 249,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 53,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-Black_5a6123f7-3bb9-4568-bd4c-cf8f8baab14a.jpg?v=1680427445",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-Black_5a6123f7-3bb9-4568-bd4c-cf8f8baab14a.jpg?v=1680427445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-16.jpg?v=1788522825",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-CadetBlue_be1edfc0-6eb5-46d0-a947-85ef0f9d6a27.jpg?v=1680427445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-SkyBlue_9f06b84a-da94-449c-bd2f-8f67c243811b.jpg?v=1680427445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-TurquoiseBlue_d2092c9b-cd24-483d-9666-63eb8fe27725.jpg?v=1680427445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-Pink_2625bbef-a0f5-4511-9a5a-b9535d2a2949.jpg?v=1680427445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/SpiroCeramicPot-White_96a3ef8e-35de-46e7-b0fc-fa1ff6564dc0.jpg?v=1680427445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/KrishPlanter-Red_50f185a6-02bc-4579-a3bf-56113b464e6f.jpg?v=1680427445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FDCB1.jpg?v=1759896428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FDM1.jpg?v=1759896428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FGCB1.jpg?v=1759896466",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FGM1.jpg?v=1759896466",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FGP1.jpg?v=1759896466",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FGW1.jpg?v=1759896466",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FRCB1.jpg?v=1759896503",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FRM1.jpg?v=1759896502",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/FRP1.jpg?v=1759896502",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-771_1.jpg?v=1785852042",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-774_1.jpg?v=1785852057",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-777_1.jpg?v=1785852072",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-780_1.jpg?v=1785851979",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-783_1.jpg?v=1785851993",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-784.jpg?v=1785852013",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-785.jpg?v=1785852086",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-787.jpg?v=1785852148",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-789.jpg?v=1785852175",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-790.jpg?v=1785852163",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-798.jpg?v=1785852221",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-801.jpg?v=1785852192",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-802.jpg?v=1785852207",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-804.jpg?v=1785852266",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-805.jpg?v=1785852028",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-807.jpg?v=1785852235",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-808.jpg?v=1785852252",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-809.jpg?v=1785852280",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-791_16533337-59a0-4829-9ffe-8beb6b54f7af.jpg?v=1785938454",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-792_7ab2d7ca-23de-4efb-8adc-1f73f8a2f90b.jpg?v=1785938475",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-13jul-796_78dbfc0b-d92e-486f-8b83-c6cc1175c07d.jpg?v=1785938490",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_1.jpg?v=1786010683",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_2_d609c918-3389-4cf1-822d-33e89ec9e015.jpg?v=1786010635",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_5.jpg?v=1786010620",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_6.jpg?v=1786010582",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_7.jpg?v=1786010698",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_8.jpg?v=1786010657",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_9.jpg?v=1786010600",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_10.jpg?v=1786010567",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Fittonia_Green_Artboard_11.jpg?v=1786010669"
    ],
    "descriptionHtml": "The Fittonia will satisfy the inner perfectionist in you. Each leaf of Fittonia Green is perfectly shaped with vivid white veins that run across the dark green leaf, earning it the names Nerve Plant and Silver Net Plant. She’s a temperamental plant, but totally worth the hassle!",
    "tags": [
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "featured",
      "flash",
      "low-maintenance",
      "pet-friendly",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "41371866497156",
        "title": "GroPot / Mocca",
        "price": 249,
        "compareAtPrice": 249,
        "available": true,
        "sku": "NUPL0222"
      },
      {
        "id": "41371866529924",
        "title": "Krish / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222KIY"
      },
      {
        "id": "41371869675652",
        "title": "Krish / White",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222KWT"
      },
      {
        "id": "41371869544580",
        "title": "Krish / Brown",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222KBN"
      },
      {
        "id": "51202088796292",
        "title": "Kyoto / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222QIY"
      },
      {
        "id": "51202088861828",
        "title": "Kyoto / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222QTC"
      },
      {
        "id": "51202088829060",
        "title": "Kyoto / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222QMC"
      },
      {
        "id": "51835962884228",
        "title": "Yoda / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222YIY"
      },
      {
        "id": "51835963080836",
        "title": "Yoda / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222YTC"
      },
      {
        "id": "51835962851460",
        "title": "Yoda / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0222YMC"
      },
      {
        "id": "41371869806724",
        "title": "Lagos / White",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0222LWT"
      },
      {
        "id": "41371869773956",
        "title": "Lagos / Mocca",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0222LMC"
      },
      {
        "id": "41371866562692",
        "title": "Lagos / Grey",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0222LGY"
      },
      {
        "id": "51181852000388",
        "title": "Roma / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222RWT"
      },
      {
        "id": "51181852033156",
        "title": "Roma / Grey",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222RGR"
      },
      {
        "id": "51181852065924",
        "title": "Roma / Magenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222RMJ"
      },
      {
        "id": "51181852098692",
        "title": "Roma / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222RCB"
      },
      {
        "id": "51181852131460",
        "title": "Roma / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222RPC"
      },
      {
        "id": "41575182499972",
        "title": "Diamond / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0222DWT"
      },
      {
        "id": "51181851771012",
        "title": "Diamond / Magenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222DMJ"
      },
      {
        "id": "51181851803780",
        "title": "Diamond / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222DCB"
      },
      {
        "id": "51181851836548",
        "title": "Diamond / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222DPC"
      },
      {
        "id": "51835963605124",
        "title": "Table Top / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0222TWT"
      },
      {
        "id": "51181851869316",
        "title": "Grail / White",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0222GWT"
      },
      {
        "id": "51181851902084",
        "title": "Grail / Magenta",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0222GMJ"
      },
      {
        "id": "51181851934852",
        "title": "Grail / Carton Brown",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0222GCB"
      },
      {
        "id": "51181851967620",
        "title": "Grail / Peach",
        "price": 465,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0222GPC"
      },
      {
        "id": "41371870068868",
        "title": "Spiro / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222SWT"
      },
      {
        "id": "41371870036100",
        "title": "Spiro / Pink",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0222SPK"
      },
      {
        "id": "41371869741188",
        "title": "Spiro / Sky Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222SSB"
      },
      {
        "id": "41371866628228",
        "title": "Spiro / Black",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0222SBK"
      },
      {
        "id": "41371869970564",
        "title": "Spiro / Turquoise Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0222STQ"
      },
      {
        "id": "41371870003332",
        "title": "Spiro / Cadet Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0222SCB"
      }
    ]
  },
  {
    "id": "6941171974276",
    "handle": "areca-palm-plant-big",
    "title": "Areca Palm Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 399,
    "compareAtPrice": 399,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 191,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-462.jpg?v=1788249473",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-462.jpg?v=1788249473",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-467.jpg?v=1788249150",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-470.jpg?v=1788249162",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-473.jpg?v=1788249179",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-476.jpg?v=1788249192",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-485.jpg?v=1788249206",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-491.jpg?v=1788249221",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-497.jpg?v=1788249235",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-498.jpg?v=1788249255",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-500.jpg?v=1788249269",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-504.jpg?v=1788249461",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-506.jpg?v=1788249297",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-508.jpg?v=1788249313",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-514.jpg?v=1788249341",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-516.jpg?v=1788249355",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-520.jpg?v=1788249374",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-521.jpg?v=1788249445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-524.jpg?v=1788249388",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-525_6ecd9eb1-55e4-4d8d-af91-2777696d4fcf.jpg?v=1788256828",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-527.jpg?v=1788249415",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-532.jpg?v=1788249434",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-485_af2a5bc4-0806-44b6-8419-68109330a967.jpg?v=1788256374",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-491_c0a1d8f4-3d1b-46ab-a976-1cb813b06956.jpg?v=1788256844",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-497_c699ee5b-1ca5-4d4c-ac76-3c28aaffd10e.jpg?v=1788256393",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-510_64d6f16e-fffa-4510-b3eb-33e278c12030.jpg?v=1788256855",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_2_84ca9ab5-b918-4f8b-9eb4-a04a20b97263.jpg?v=1788278133",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_3_02b1304a-cfa6-4b81-a963-afd052a84ade.jpg?v=1788278149",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_4_a33c05ec-37bd-4b5e-828b-4985e9b42779.jpg?v=1788278161",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_5_d8a13a81-f406-428a-a9d6-e6934341d9cf.jpg?v=1788278179",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_6_b20b4580-9acc-4fb7-a0c2-8110352ae2ed.jpg?v=1788278192",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_7_f5ba1590-ee01-4579-b9b6-8616a48aee66.jpg?v=1788278208",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_8_b68b5129-a860-4bb0-9105-151fff4fd62c.jpg?v=1788278220",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_9_8aa59cf6-da9e-416a-acb6-fb99569ef6a1.jpg?v=1788278237",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_10_1b55c91f-1db0-4a1b-9f97-7863098b2205.jpg?v=1788278251",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Medium_Areca_Artboard_11.jpg?v=1788278266",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-163.jpg?v=1792230756",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-164.jpg?v=1792230768",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-165.jpg?v=1792230799",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-166.jpg?v=1792230783",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Bigslot1-31aug26-167.jpg?v=1792230818",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_2.jpg?v=1792230833",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_3.jpg?v=1792230854",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_4.jpg?v=1792230869",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_5.jpg?v=1792230882",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_6.jpg?v=1792230896",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_7.jpg?v=1792230916",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_8.jpg?v=1792230928",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_9.jpg?v=1792230943",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Areca_Palm_10.jpg?v=1792230959"
    ],
    "descriptionHtml": "Once an endangered species, the Areca Palm is a staple in Indian spaces. One of the most undervalued plants in the indoor plant category. This excellent air purifier is pet friendly and easy to grow. Its delicate leaves/fronds grow outwards in a curved manner and add a tropical feel to any space and can adapt to a variety of growing conditions.",
    "tags": [
      "Birthday",
      "Birthday_plants",
      "flash",
      "morden",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly",
      "XL-Plant"
    ],
    "variants": [
      {
        "id": "41371059060868",
        "title": "Medium / GroPot / Mocca",
        "price": 399,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0097"
      },
      {
        "id": "41371056177284",
        "title": "Medium / Krish / Ivory",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0097KIY"
      },
      {
        "id": "41371059191940",
        "title": "Medium / Krish / Red",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0097KRD"
      },
      {
        "id": "41371059224708",
        "title": "Medium / Krish / Yellow",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0097KYL"
      },
      {
        "id": "41371059257476",
        "title": "Medium / Krish / Brown",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0097KBN"
      },
      {
        "id": "41371059290244",
        "title": "Medium / Krish / Light Green",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0097KLG"
      },
      {
        "id": "52748409503876",
        "title": "Medium / York / Mocca",
        "price": 499,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0097YMP"
      },
      {
        "id": "52748373098628",
        "title": "Medium / York / White",
        "price": 499,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0097YRW"
      },
      {
        "id": "52748401377412",
        "title": "Medium / York / Terracotta",
        "price": 499,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0097YRT"
      },
      {
        "id": "52748817793156",
        "title": "Medium / Diamond / White",
        "price": 749,
        "compareAtPrice": 399,
        "available": false,
        "sku": "NUPL0097DWT"
      },
      {
        "id": "52748573933700",
        "title": "Medium / Grail / White",
        "price": 799,
        "compareAtPrice": 399,
        "available": false,
        "sku": "NUPL0097GWT"
      },
      {
        "id": "41371059650692",
        "title": "Medium / Grail / Peach",
        "price": 799,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0097GPC"
      },
      {
        "id": "52748885622916",
        "title": "Medium / Roma / White",
        "price": 799,
        "compareAtPrice": 399,
        "available": false,
        "sku": "NUPL0097RWT"
      },
      {
        "id": "52748907118724",
        "title": "Medium / Roma / Grey",
        "price": 799,
        "compareAtPrice": 399,
        "available": false,
        "sku": "NUPL0097RGY"
      },
      {
        "id": "52748844826756",
        "title": "Medium / Frosted / White",
        "price": 799,
        "compareAtPrice": 399,
        "available": false,
        "sku": "NUPL0097FWT"
      },
      {
        "id": "52748881690756",
        "title": "Medium / Frosted / Dusty rose",
        "price": 799,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0097FDR"
      },
      {
        "id": "41584560832644",
        "title": "Medium / Aurelius / White",
        "price": 899,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0097AWG"
      },
      {
        "id": "41584560865412",
        "title": "Medium / Aurelius / Grey",
        "price": 899,
        "compareAtPrice": 1100,
        "available": false,
        "sku": "NUPL0097AGG"
      },
      {
        "id": "52748450562180",
        "title": "Medium / Aurelius / Mint",
        "price": 899,
        "compareAtPrice": 399,
        "available": false,
        "sku": "NUPL0097AMG"
      },
      {
        "id": "41584560898180",
        "title": "Medium / Prism / White",
        "price": 899,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0097DWG"
      },
      {
        "id": "41584560930948",
        "title": "Medium / Prism / Cream",
        "price": 899,
        "compareAtPrice": 1749,
        "available": false,
        "sku": "NUPL0097PCG"
      },
      {
        "id": "52748565872772",
        "title": "Medium / Prism / Mint",
        "price": 899,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0097PMG"
      },
      {
        "id": "41151039045764",
        "title": "Large / GroPot / Ivory",
        "price": 799,
        "compareAtPrice": 799,
        "available": true,
        "sku": "NUPL0619"
      },
      {
        "id": "41565556736132",
        "title": "Large / Krish / Ivory",
        "price": 999,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0619KIY"
      },
      {
        "id": "41565556801668",
        "title": "Large / Krish / Yellow",
        "price": 999,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0619KYL"
      },
      {
        "id": "41565556834436",
        "title": "Large / Krish / Brown",
        "price": 999,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0619KBN"
      },
      {
        "id": "41565556932740",
        "title": "Large / Krish / White",
        "price": 999,
        "compareAtPrice": 1100,
        "available": true,
        "sku": "NUPL0619KWT"
      }
    ]
  },
  {
    "id": "7293511958660",
    "handle": "lotus-lucky-bamboo-5-sticks",
    "title": "Lotus Lucky Bamboo 5 Sticks",
    "category": "plants",
    "subCategory": "plants",
    "price": 499,
    "compareAtPrice": 499,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 259,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c9475882-288b-4e9c-8066-f7b998aea0d0.jpg?v=1741080598",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c9475882-288b-4e9c-8066-f7b998aea0d0.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_ca1546eb-615a-4676-9511-c222bf38eaa3.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_43d48735-b4b6-4822-b4c4-c3362ff89723.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_2c8250c5-6bf7-4810-8b69-a314ae2a3236.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_60f08e3f-c61b-41ee-ba4c-4694bfae4c48.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_84876f0d-1161-4cce-a75f-898ebe00e3e9.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_5388d330-9b93-4090-a88d-07d2f40baed8.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_7b428613-15b6-4d72-9f17-3bba23d28cc9.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_cbf21408-9a69-4e27-8f50-12b318848e1f.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_385e063e-37c0-4d9b-90a2-4c78979c269a.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_5512f87a-b82c-484e-bae8-0db8f80002e6.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_bce521fa-5c26-4102-9042-7c2147a33e4f.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_b13c6969-3eb1-4c76-9a76-c89a04563485.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_7fe476d4-1d96-49df-90cc-f1effbbce0b6.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_dc811e34-d8b8-441c-8e46-17367775dabe.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_b1e34a31-c803-4144-bacb-580291fe8cc3.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_960ea786-b293-480b-892e-280fd41d0352.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_3fbd2eb3-20ea-4721-b52e-562fb7ab04f6.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_3fbcc370-53da-4fe4-b9b8-5a928201bacc.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_ef02cad1-ae9d-4696-9812-281abf08e469.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_15fb48c4-7bee-497b-a264-98700110c8eb.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_235befcd-932d-445d-99af-704346332b8a.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_d38318ed-e942-4532-b5b1-e80084535b0e.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_2a574009-df7c-4474-acb6-72f7fb0d0889.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_423651d2-f3e1-4a98-989b-8f1d405e2b4f.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_c0ae7f4c-284b-4ec6-9a15-03ff3de467da.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_ff0d2137-cbc8-49b0-be3c-ffc2a89af7ad.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_1576ca69-2c28-4115-9854-cf4661f2b7a4.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_da8c6b30-16c5-4b22-b14a-7f4446a450c7.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_cff5176b-1392-4930-84ce-75a23fe5b0e4.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_c3faa2e4-e9e3-4c50-ab74-f9752ce85c04.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_b49c1e3b-0281-404b-a614-ecac4fb62037.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_d1070cb8-67c6-45b2-8aaf-11c001bc1b86.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_6b562de3-b94c-4c64-99ed-a984234832a0.jpg?v=1741080598",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_a5ed182c-237f-4de9-af8e-01b92557e345.jpg?v=1726305278",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_09728187-8549-48c0-8046-c0666f8abd7c.jpg?v=1726305274",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_0f4f328b-93e1-491d-8b64-085f2f220035.jpg?v=1724849112",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_9411137c-a066-4f54-b7b5-9f8a470fc33c.jpg?v=1724849112",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_f6862347-0c86-4a72-8dc5-56e042a0707f.jpg?v=1726305272",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_ea02119e-a60f-486f-ab01-c12379cd3b97.jpg?v=1726305269",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_ac0b41b6-8bbd-4ab1-88b6-e5d5dd8fccf8.jpg?v=1724849112",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_fb339f85-d141-4add-a6f5-09529cad7615.jpg?v=1726305266",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_d4db555c-f1bb-44d9-ad2a-0270b85bb337.jpg?v=1726305268",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_2474daf0-02d4-4604-9028-0b812bfeb222.jpg?v=1724849118",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_9adb2aa8-03f9-47f1-a38b-d40f959c6281.jpg?v=1724849118",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_69fbc1be-165a-430c-8fe1-91bad084d7e8.jpg?v=1726304430",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_92fafb40-1140-4c26-afa2-bb6042e26de3.jpg?v=1726304431",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_e6048222-e05b-4947-adf3-eb674ca8505c.jpg?v=1724849118",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_ad77cc25-3819-4d60-9bc8-647a417c47e6.jpg?v=1726304439",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_1d689eeb-c22d-4383-8644-a268e70b6454.jpg?v=1726304743",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c053ae20-f8ec-400a-9e7f-60cc3aa7af3d.jpg?v=1724849259",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_1326c6fb-67d9-4662-863d-d6fefdec63d5.jpg?v=1724849259",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_be53c400-b7d4-4441-a40c-51020a2a6267.jpg?v=1726304434",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_2e6da8f0-1dfb-4719-8d5e-5d6674b941ad.jpg?v=1726306734",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_4c590c07-1b1c-4115-89e1-01320e5da569.jpg?v=1724849260",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_1df37b7c-d1c7-4670-9c0f-9325102b1bd5.jpg?v=1726306742",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_d2deb4a7-56b9-4ef9-912b-fdda2fd20c65.jpg?v=1726304440",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_6b5862fb-d979-4c4c-b99c-09af00a9f137.jpg?v=1724849268",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_a6071198-b9da-4b4f-92d7-77d6f3924a2b.jpg?v=1726304752",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_c6433c7c-ba40-4954-84fe-b150e0b2af49.jpg?v=1726304437",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_0ad739b5-fb51-4050-a108-ca12f43c7897.jpg?v=1724849268",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_6432b9b0-b2d5-4eb6-8036-aa97c0b5ab9e.jpg?v=1726304741",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_21a95f99-7d38-4fef-a56b-3bb9233c3dd3.jpg?v=1726304745",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_b68bebbf-2eac-4196-ba7d-a207b81fd8b2.jpg?v=1724849277",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_db9fc6d9-42c1-4040-b1fa-8fda4fc1c0a9.jpg?v=1724849278",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_5c725ba5-de5d-4c22-980d-182f9edb94f5.jpg?v=1726304753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_2286aac7-9853-4581-8978-59fcf8f57c22.jpg?v=1726304750",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_dda0909b-af18-4c29-8282-fc82529ad04d.jpg?v=1724849277",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_d9369ae6-dd2a-4e44-93f2-f1dbd39f714e.jpg?v=1726304755",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_91fbfc0b-ac63-4753-8ad3-3d87da5e9c4d.jpg?v=1726304749",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_865a0f27-9068-47c0-b336-f82f535516fc.jpg?v=1724849283",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_46d52896-0a36-4e71-bd16-0720c8f67790.jpg?v=1724849283",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_e60d69d7-011e-482a-9c89-7d5ac0aba740.jpg?v=1726304746",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_7e8fd32f-d16a-4007-b818-7a1706570d5c.jpg?v=1726304748",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_6b40737e-17d1-425f-8344-df45b49753ee.jpg?v=1724849283",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_ef7586b4-b7b2-42f8-8c67-7a5947c9d0aa.jpg?v=1726304428",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_1133e0d7-3042-4bd3-994e-f950b785c456.jpg?v=1726304736",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_40b57031-f3d4-4f23-9dd4-8e5b4117cf82.jpg?v=1724849289",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_9473dc2d-3c08-40cd-a0a7-9c488a31eb06.jpg?v=1724849289",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_872f1375-2a63-4a45-86f8-9079f429c28b.jpg?v=1726304738",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_0d48858f-7dc5-4fd7-aced-b3f0bff993f9.jpg?v=1726304739",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_73b97acf-9df5-41f6-9d32-0cb53606dc9b.jpg?v=1724849289",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_0833fa68-86f4-4edb-89c7-94766b291a8a.jpg?v=1726304742",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_64d16f71-aebd-4e5f-9776-c7fc35fc65c6.jpg?v=1726304436",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_da58d744-be10-418a-8aaa-2a59bffd8f54.jpg?v=1724849295",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_fa2815d1-aed2-4dc2-bae1-1812f49fd859.jpg?v=1724849295",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_72876828-4555-4a93-8f04-96b8e812d418.jpg?v=1726304433",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_32563d31-276c-49e5-8a82-057c2231d954.jpg?v=1726304425",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_7a80bb26-5423-4a05-ac1f-846d852c25b4.jpg?v=1724849297",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_c671c0f9-80fd-40a3-8d33-c8ab150bde42.jpg?v=1726304733",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_f5109cff-4d37-4652-ba2c-12b8619247da.jpg?v=1726304423",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_8945c6ae-e21d-4936-8255-8baaf92a8b1a.jpg?v=1724849518",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_fd68fdbe-d07f-4c59-95e8-a0429dfac385.jpg?v=1724849518",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_704cba06-d483-450d-a43b-d5865fdfe729.jpg?v=1726304424",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_beb05e9f-14f4-4777-bb98-c57696ce5b1e.jpg?v=1726304421",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_d110a3c8-911d-43f9-b58b-f09b92a3d18a.jpg?v=1724849519",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_92bf3391-b1ab-4db2-8f62-5819caccc1a8.jpg?v=1726304427",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_a61b8365-7843-4067-84de-82cde33e5919.jpg?v=1726304729",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_034fef94-1957-4a27-a34e-dee34b778dd7.jpg?v=1724849522",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_3b2f37ea-5a32-49f8-b4b9-b2c6a9aad8b5.jpg?v=1724849523",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_538d8aa5-1572-40c4-a620-763331efded4.jpg?v=1726304418",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_eb1b9a1c-78ae-486f-866d-0bd58dc5e1cb.jpg?v=1726304420",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_c7a4a2ed-f829-492a-84a7-b8d759922566.jpg?v=1724849523",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_c03c194b-e174-42c3-927f-9ff3aaa95f78.jpg?v=1726304417",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_6db0f649-680f-42b6-bdb7-b4e972027cae.jpg?v=1726304416",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_05b1f932-80b6-43be-893e-bda8bbe3e745.jpg?v=1724849528",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_fc836271-88df-406f-8831-7e366f2ef4d9.jpg?v=1724849528",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_4fef3512-658c-4742-a5cc-d9c6c501f93a.jpg?v=1726304196",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_651c9de5-1d82-41eb-96bb-85dbe9678318.jpg?v=1726304195",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_0e49b868-9512-4c92-9ed2-80198cf8e7fc.jpg?v=1724849528",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_95984fbe-e040-471e-bb63-8f2a129bb296.jpg?v=1726304188",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_21c1bdcb-d16e-4f93-bb69-9638261cbc05.jpg?v=1726304193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_367dfc2d-9b91-408e-9231-25ee4bf9b99c.jpg?v=1724849685",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_c2a4b412-a630-4d2f-89ad-e28584c4b759.jpg?v=1724849685",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_0e1d90e4-347e-4f9c-b4b4-3be548b1378f.jpg?v=1726304173",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_3226a9c5-26ec-40cb-a4af-c49814fcef73.jpg?v=1726304171",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_5af4c6c7-a782-4678-aa10-2e40833f454f.jpg?v=1724849685",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_2c21f207-2497-4da0-b0fe-b50233108392.jpg?v=1726304167",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_22176e05-c552-4d8c-8133-3ed5b97b99cc.jpg?v=1726304164",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_a48eee47-1439-426c-85fb-1f65eb5490a1.jpg?v=1724849693",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_2cee1d8e-4367-496c-ad73-665ca657111c.jpg?v=1724849693",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_27569b11-8589-45d6-a3e8-9ecce4192121.jpg?v=1726304163",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_ba5a66f9-5492-4540-84c4-cafc1c7eaf68.jpg?v=1726304160",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_e588eb1f-6a2a-4fba-9343-b61577b7d3f9.jpg?v=1724849694",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_a012bb89-6d2f-4930-893e-4e0de055da59.jpg?v=1726304166",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_0cff8245-1d02-4f70-8835-28781e982f28.jpg?v=1726304157",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_f9d34f3a-aa7f-43a6-bdd5-bfcbe0a094d7.jpg?v=1724849818",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_4102374f-edc6-434f-8198-560df5570abd.jpg?v=1724849818",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_7a027930-a917-4f5f-af28-d63359926132.jpg?v=1726304414",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_5dde234d-a537-4b85-9b1f-e578450a83bc.jpg?v=1726304406",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_05767aac-644d-48c1-a892-995ef01a093b.jpg?v=1724849818",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_67b10160-37f5-458e-bf9f-ba5dc01731d0.jpg?v=1726304405",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_4c821e9d-f02c-4786-9013-5506a97466d9.jpg?v=1726304401",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_38475655-7e91-4d01-b67f-7d45d4a5c250.jpg?v=1724849825",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_291e83c6-b062-4da9-8fcb-c1b6a7bd3868.jpg?v=1724849826",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_02895214-5c9c-49b6-b698-bacb65296246.jpg?v=1726304730",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_6d568536-8a8b-435a-bd2a-06425cc0f7b9.jpg?v=1726304402",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_f5de8cf2-e0e3-40f4-9259-e67bdea09286.jpg?v=1724849826",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_d589cb2d-1119-41e1-ba3d-56c84dc514b6.jpg?v=1726304403",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_35d9ce94-2264-48c9-ac32-64cdb0bf094f.jpg?v=1726304399",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_26b2b6c4-e9e3-475f-aa5a-7e558006c406.jpg?v=1724849831",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_fa5e5f14-d6e4-45d8-a41b-374ac26bf5ad.jpg?v=1724849831",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_6e9df1a9-3081-493d-a0f9-ffaee92fc150.jpg?v=1726304398",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_1381ad68-25ff-4cfb-be0f-39e2f9cf9485.jpg?v=1726304395",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_4b8152a3-9a50-479e-978e-11932b1102b0.jpg?v=1724849832",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_2bb1ae45-72ca-401c-8e85-ff7e2ee1500c.jpg?v=1726304394",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_bfd976ee-695a-4805-97ac-1fea0bccd6c2.jpg?v=1726304396",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_e4554e31-c1ac-4b4e-9392-4d232b8c8d64.jpg?v=1724849836",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_314af2fb-edf4-4141-a0e6-857ee733c27c.jpg?v=1724849836",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_47475435-b9cb-4a83-9e23-06e9b8f5486f.jpg?v=1726304393",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_ff1be212-75d7-40ce-9706-4184049978f2.jpg?v=1726304387",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_02964277-d676-4c80-b7c2-fa4f6266d33b.jpg?v=1724849836",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_b13345fd-889c-426c-a2f7-fb42cdb2992c.jpg?v=1726304385",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_3fc2ae18-9a72-4656-9c7c-630fac5e8896.jpg?v=1726304382",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_488ebba4-dd86-427c-a8a5-f955ba182adf.jpg?v=1724849963",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_06f25ac2-94fb-4ab1-baa0-5f93df1ac488.jpg?v=1724849963",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_ee102925-e058-41d8-a5ff-170c32272f3d.jpg?v=1726304380",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_1d81ebc1-e933-45d2-bbff-03a4137a57a8.jpg?v=1726304384",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_812edbc1-3b09-420c-a294-06a4f9c1b86f.jpg?v=1724849963",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_12f0e68f-acb7-4a79-a196-6aeeeffa082c.jpg?v=1726304323",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_e9d49377-f8a7-4cce-b098-d8506f8c91ff.jpg?v=1726304322",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_3d34e4c6-2b95-426e-9bc9-ea393872808a.jpg?v=1724849971",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_5c9e5bd1-3cfc-4ad6-be47-654a06787bc8.jpg?v=1724849972",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_5c2a7bc7-abcc-416a-a367-54d39a81e07e.jpg?v=1726304321",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_505b7055-f8a7-4dec-a01b-dba40d4ebbd2.jpg?v=1726304317",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_ab1ea7f8-68a9-4e03-896e-21cd9a94cbda.jpg?v=1724849972",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_54421ddf-e8f5-466e-a9d4-a08bc66aee9f.jpg?v=1726304319",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_a8233e01-c964-4276-b51c-e82f0f031e02.jpg?v=1726304314",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_7801ab8a-83d8-4e95-ad43-42627d518415.jpg?v=1726304313",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_42ad720b-6318-42f6-8d69-18f1f402ea64.jpg?v=1724849993",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_560205ee-ff05-4db4-8df5-416a555fb42f.jpg?v=1726304318",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_35e0338b-0cee-48d4-bdcc-3a0ac4eac633.jpg?v=1726304623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_6d91fbbd-3270-45a3-9071-6abdec38c423.jpg?v=1724849993",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_5529a825-8fdb-4a1f-bee9-c39e2438a567.jpg?v=1726304311",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_193ca470-e698-425b-b746-fe2b49967c4d.jpg?v=1726304310",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_174fea25-0af2-4047-983b-14c8eef811a3.jpg?v=1726304627",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_9c08f916-8a3c-4dde-9826-f8b5778ccd3d.jpg?v=1724849998",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_fea1bdf0-5218-4372-8e9a-da661329574b.jpg?v=1726304628",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_c818c0f5-d267-4c30-b594-98138e1778eb.jpg?v=1726304315",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_3dc620f9-8efb-4ad4-af17-304a2b4c18bb.jpg?v=1724849998",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_60cdaa42-a248-415f-82ed-fe629da3da72.jpg?v=1726304309",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_30f9b633-84b7-491d-ab9c-e86fbd5c36e7.jpg?v=1726304287",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_303f6135-83cc-4764-8e0a-00551b7e11dd.jpg?v=1726304286",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_c2d1b532-950c-48d2-9643-787586dc86ef.jpg?v=1724850004",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_969f8e0c-a69e-46a3-a8ff-b21271109c62.jpg?v=1726304285",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_ecf19147-6ddf-4005-9031-c19d5c190727.jpg?v=1726304283",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_90213136-8808-46df-af4f-9becf4b1fe57.jpg?v=1724850004",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_a90c9e17-3a47-4c90-aa51-97a72c6781be.jpg?v=1726304282",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_4ea3c119-452c-4874-9ac0-d91b16899975.jpg?v=1726304280",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_8896855f-58ad-4d91-8906-ace85b444d80.jpg?v=1724850009",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_6d387a08-eb13-4df2-8021-9fc9a69d15da.jpg?v=1724850009",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_721b6324-d157-4c9f-8aee-69eabb66f939.jpg?v=1726304279",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_2ffe45a9-b862-41eb-9e11-ccc63758184a.jpg?v=1726304275",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_5c04ff91-bbc8-4a7c-89eb-88a54e1e0ce3.jpg?v=1724850009",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_0c7fd535-5399-42d5-826b-7175823464d3.jpg?v=1726304273",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_878bb128-e113-46f8-84a1-e0b675bc3d81.jpg?v=1726304272",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_32093764-878f-406d-97df-b1c7a7a4fc74.jpg?v=1724916623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_a222a4a5-7971-4a09-a361-69e27dd8ac43.jpg?v=1724916623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_1275283b-cdf2-41a6-a85b-6e948ae9120f.jpg?v=1726309342",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_110bf9db-5fa3-471c-9c98-01817bec2000.jpg?v=1726309336",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_9bcf0de6-abc6-4c84-ac43-6cfefeb4e9a0.jpg?v=1724916623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_4c9b81d0-192d-46ca-afd0-1315c8fda1d8.jpg?v=1726309337",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_d5140b65-f24e-47b9-9a7f-824067785d09.jpg?v=1726309341",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_f77d4588-ee3f-4650-9c35-604fb972e50a.jpg?v=1724916629",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_8243fc1e-179a-4704-b3ed-edd7201477fd.jpg?v=1724916629",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_a0491afd-6333-4d40-a287-09a6082b328f.jpg?v=1726309193",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_eef105de-8fd6-469e-a22e-c113fb0b47a5.jpg?v=1726309192",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_fa9315bb-ec7a-48c3-8643-17f642ad4649.jpg?v=1724916629",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_7135c5b4-4593-45f4-b5b1-bc0ec237a18e.jpg?v=1726309190",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_fe69f63e-5ce9-45c9-bb35-de277dd9dc68.jpg?v=1726309176",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_01cb2fde-5b8a-474a-a364-16c08fabcfeb.jpg?v=1724916634",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_9e169076-9d01-4629-8f9e-986a5f9dc61e.jpg?v=1724916634",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_6c4832dd-0557-458f-a277-a962fae2b104.jpg?v=1726309172",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_e5fbde11-63d4-4910-b4c3-d8f19ea15542.jpg?v=1726309169",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_4fdfcf92-84bb-4014-9bd5-1cb73cfe5b66.jpg?v=1724916635",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_3d10573a-01cf-4d31-a7d2-6aea705191ae.jpg?v=1726309143",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_4d2569d3-03c6-4d5e-8c41-f58160fb4f4c.jpg?v=1726309135"
    ],
    "descriptionHtml": "<p dir=\"ltr\"><span>As one of the most popular and renowned Feng Shui plants in the world, the Lotus Lucky Bamboo makes for the perfect indoor plants - whether you’re looking to gift it or keep it in your home or office space. The five thick stalks of the plant symbolize balance and peace, often being respected as harbingers of luck and positivity into the lives of their caretakers. This stunning indoor plant boasts unique stems and lovely patterns with a dense foliage that greatly adds to its charm. Additionally, this plant is super low maintenance and fuss-free, making it perfect for new and experienced gardeners alike.</span></p>\n<p> </p>",
    "tags": [
      "b2g1",
      "buy3",
      "low-maintenance",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "41901765853316",
        "title": "GroPot / Ivory",
        "price": 499,
        "compareAtPrice": 499,
        "available": true,
        "sku": "NUPL1038"
      },
      {
        "id": "41901765886084",
        "title": "Krish / Ivory",
        "price": 649,
        "compareAtPrice": 899,
        "available": false,
        "sku": "NUPL1038KIY"
      },
      {
        "id": "41901765918852",
        "title": "Krish / White",
        "price": 649,
        "compareAtPrice": 899,
        "available": true,
        "sku": "NUPL1038KWT"
      },
      {
        "id": "41901765951620",
        "title": "Krish / Yellow",
        "price": 649,
        "compareAtPrice": 899,
        "available": false,
        "sku": "NUPL1038KYL"
      },
      {
        "id": "41901765984388",
        "title": "Krish / Light Green",
        "price": 649,
        "compareAtPrice": 899,
        "available": false,
        "sku": "NUPL1038KLG"
      },
      {
        "id": "41901766017156",
        "title": "Krish / Brown",
        "price": 649,
        "compareAtPrice": 899,
        "available": false,
        "sku": "NUPL1038KBN"
      },
      {
        "id": "41901766049924",
        "title": "Krish / Red",
        "price": 649,
        "compareAtPrice": 899,
        "available": false,
        "sku": "NUPL1038KRD"
      },
      {
        "id": "41901766082692",
        "title": "Atlantis / Yellow",
        "price": 699,
        "compareAtPrice": 949,
        "available": true,
        "sku": "NUPL1038AYL"
      },
      {
        "id": "41901766115460",
        "title": "Atlantis / Brown",
        "price": 699,
        "compareAtPrice": 949,
        "available": false,
        "sku": "NUPL1038ABN"
      },
      {
        "id": "41901766148228",
        "title": "Atlantis / Midnight Blue",
        "price": 699,
        "compareAtPrice": 949,
        "available": false,
        "sku": "NUPL1038AMB"
      },
      {
        "id": "41901766180996",
        "title": "Atlantis / Teal",
        "price": 699,
        "compareAtPrice": 949,
        "available": false,
        "sku": "NUPL1038ATL"
      },
      {
        "id": "41901766213764",
        "title": "Atlantis / Pastel Blue",
        "price": 699,
        "compareAtPrice": 949,
        "available": false,
        "sku": "NUPL1038ABL"
      },
      {
        "id": "41901766246532",
        "title": "Atlantis / Pink",
        "price": 699,
        "compareAtPrice": 949,
        "available": false,
        "sku": "NUPL1038APK"
      },
      {
        "id": "41901766279300",
        "title": "Lagos / White",
        "price": 749,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL1038LWT"
      },
      {
        "id": "41901766312068",
        "title": "Lagos / Grey",
        "price": 749,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL1038LGY"
      },
      {
        "id": "41901766344836",
        "title": "Lagos / Mocca",
        "price": 749,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL1038LMC"
      },
      {
        "id": "41901766377604",
        "title": "Roma / White",
        "price": 795,
        "compareAtPrice": 1099,
        "available": false,
        "sku": "NUPL1038RWT"
      },
      {
        "id": "41901766410372",
        "title": "Roma / Grey",
        "price": 795,
        "compareAtPrice": 1099,
        "available": false,
        "sku": "NUPL1038RGY"
      },
      {
        "id": "41901766443140",
        "title": "Diamond / White",
        "price": 795,
        "compareAtPrice": 1099,
        "available": false,
        "sku": "NUPL1038DWT"
      },
      {
        "id": "41901766475908",
        "title": "Diamond / Mint",
        "price": 795,
        "compareAtPrice": 1099,
        "available": false,
        "sku": "NUPL1038DMT"
      },
      {
        "id": "41901766508676",
        "title": "Diamond / Eggshell White",
        "price": 795,
        "compareAtPrice": 1099,
        "available": false,
        "sku": "NUPL1038DES"
      },
      {
        "id": "41901766541444",
        "title": "Diamond / Dusty Rose",
        "price": 795,
        "compareAtPrice": 1099,
        "available": false,
        "sku": "NUPL1038DDR"
      },
      {
        "id": "41901766574212",
        "title": "Spiro / White",
        "price": 799,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUPL1038SWT"
      },
      {
        "id": "41901766606980",
        "title": "Spiro / Black",
        "price": 799,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUPL1038SBK"
      },
      {
        "id": "41901766639748",
        "title": "Spiro / Cadet Blue",
        "price": 799,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUPL1038SCB"
      },
      {
        "id": "41901766672516",
        "title": "Spiro / Sky Blue",
        "price": 799,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUPL1038SSB"
      },
      {
        "id": "41901766705284",
        "title": "Spiro / Turquoise Blue",
        "price": 799,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUPL1038STQ"
      },
      {
        "id": "41901766738052",
        "title": "JAR / Eggshell White",
        "price": 799,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUPL1038JES"
      },
      {
        "id": "41901766770820",
        "title": "JAR / Dusty Rose",
        "price": 799,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUPL1038JDR"
      },
      {
        "id": "41901766803588",
        "title": "JAR / Cloud Grey",
        "price": 799,
        "compareAtPrice": 900,
        "available": true,
        "sku": "NUPL1038JCG"
      },
      {
        "id": "41901766836356",
        "title": "Spiro / Pink",
        "price": 799,
        "compareAtPrice": 900,
        "available": true,
        "sku": "NUPL1038SPK"
      }
    ]
  },
  {
    "id": "6940859007108",
    "handle": "lucky-bamboo-plant-2-layer",
    "title": "Lucky Bamboo Plant - 2 Layer",
    "category": "plants",
    "subCategory": "plants",
    "price": 249,
    "compareAtPrice": 249,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 87,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-671.jpg?v=1785859435",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-671.jpg?v=1785859435",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-672.jpg?v=1785859466",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-673.jpg?v=1785859481",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_2_Layer_Artboard_2.jpg?v=1786010909",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_2_Layer_Artboard_3.jpg?v=1786010922",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_2_Layer_Artboard_4.jpg?v=1786010937",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_2_Layer_Artboard_6.jpg?v=1786010954",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_2_Layer_Artboard_8.jpg?v=1786010969",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_2_Layer_Artboard_10.jpg?v=1786010983",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Lucky_Bamboo_Plant_-_2_Layer_Artboard_11.jpg?v=1786010998"
    ],
    "descriptionHtml": "<p dir=\"ltr\"><span>Easy to grow and care for, the Lucky Bamboo plant is a popular indoor plant because of more reasons </span><span>than</span><span> just its care requirements. According to Feng Shui, this is one of the best lucky plants for homes, and its reputation as such greatly adds to its charm and allure. Additionally, it is also a great gifting option that works as a personal pick-me-up!</span></p>\n<p> </p>",
    "tags": [
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "Easy-care",
      "flash",
      "low-light",
      "low-maintenance",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "41235144638596",
        "title": "Glass Bowl",
        "price": 249,
        "compareAtPrice": 249,
        "available": true,
        "sku": "NUPL0099"
      },
      {
        "id": "41235144605828",
        "title": "Lotus Glass Bowl",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0761"
      },
      {
        "id": "41860698931332",
        "title": "Candle Jar",
        "price": 349,
        "compareAtPrice": 450,
        "available": true,
        "sku": "NUPL3377"
      }
    ]
  },
  {
    "id": "6941188423812",
    "handle": "chlorophytum-spider-plant",
    "title": "Chlorophytum Spider Plant",
    "category": "plants",
    "subCategory": "plants",
    "price": 249,
    "compareAtPrice": 249,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 278,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/GrailCeramicPot-Peach_dd9d1331-652c-4cc6-abef-3de44facdebb.jpg?v=1758697793",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/GrailCeramicPot-Peach_dd9d1331-652c-4cc6-abef-3de44facdebb.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jackie_A_image_-02_1.jpg?v=1788515476",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_9049_4d07633b-d1cd-46c2-9b4e-fa2e86e66fe0.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/AtlantisPlanter-PastelYellow_8e578d73-633f-43b1-bb5b-68adc81a263c.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_9092_28a7629c-0198-4720-a615-c1d69519b787.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-Black_22a1c0df-0f53-4fe8-a320-980622ccb611.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606_9996789b-5f5f-4ac2-a914-2b5b97c52c79.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy-Copy_2.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-LightGrey_49bd2fcc-cfd5-4112-9e43-19c542c2dffb.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy-Copy_3.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/Venice12Planter-White_9a8aaf9a-3263-47e3-980b-a79d335fd413.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy_2.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy-Copy_4.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy-Copy.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy_3.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy_4.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy_5.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy_6.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/GrailCeramicPot-Peach_dcb1808a-957b-4343-b96c-cfe6a0d84e02.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606-Copy.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/DSC_1606_37ecd178-7158-4b5e-9b99-7a5ea9af5443.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_5955ceb1-ab93-4fd7-a8a0-da32d147e636.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_a1203312-1daa-47bb-8c5a-dc81f4bd87ca.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_fc30e2fc-02e5-4116-8516-ef15f4ada383.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_769d83e5-82a9-452a-aaea-008842b22b07.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_ecd4a039-29e1-4c5b-9735-f60f563e1fda.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_f9e17f5f-725e-4809-a8a8-f0932527cb9f.jpg?v=1758697793",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SDCB1.jpg?v=1759901542",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SDM1.jpg?v=1759901542",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGCB1.jpg?v=1759901572",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGM1.jpg?v=1759901572",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGP1.jpg?v=1759901573",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SGW1.jpg?v=1759901573",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SRCB1.jpg?v=1759901603",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SRM1.jpg?v=1759901603",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SRP1.jpg?v=1759901603",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-621.jpg?v=1785858792",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-622.jpg?v=1785858806",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-624.jpg?v=1785858820",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-629.jpg?v=1785858835",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-643.jpg?v=1785858912",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-639.jpg?v=1785858882",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-641.jpg?v=1785858895",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-635.jpg?v=1785859047",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-630.jpg?v=1785858855",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-637.jpg?v=1785858869",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-647.jpg?v=1785858955",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-646.jpg?v=1785858940",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-644.jpg?v=1785858927",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-654.jpg?v=1785859015",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-651.jpg?v=1785859001",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-650.jpg?v=1785858989",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-656.jpg?v=1785859032",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-8jul-649.jpg?v=1785858973",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_1.jpg?v=1786010430",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_2.jpg?v=1786010491",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_5.jpg?v=1786010506",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_6.jpg?v=1786010477",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_7.jpg?v=1786010557",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_8.jpg?v=1786010520",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_9.jpg?v=1786010459",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_10.jpg?v=1786010443",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/New_Chlorophytum_Spider__Artboard_11.jpg?v=1786010540",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-538.jpg?v=1788358350",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-540.jpg?v=1788358362",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-542.jpg?v=1788358088",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-543.jpg?v=1788358377",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-546.jpg?v=1788358394",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-547.jpg?v=1788358408",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-549.jpg?v=1788358423",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-551.jpg?v=1788358093",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-554.jpg?v=1788358095",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-557.jpg?v=1788358155",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-558.jpg?v=1788358170",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-559.jpg?v=1788358184",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-560.jpg?v=1788358196",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-561.jpg?v=1788358214",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-565.jpg?v=1788358227",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-566.jpg?v=1788358241",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-568.jpg?v=1788358254",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-570.jpg?v=1788358274",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-571.jpg?v=1788358452",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-572.jpg?v=1788358288",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-573.jpg?v=1788358304",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-574.jpg?v=1788358315",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-medium-30jul-575.jpg?v=1788358334"
    ],
    "descriptionHtml": "<ul>\n<li>Chlorophytum Spider, also the Spider Plant is an impressive indoor plant and perfect for beginners.</li>\n<li>It is not only easy to care for but also a NASA certified air purifier.</li>\n<li>Its long, green foliage with white variegations look good in both hanging planters and as desktop setups.</li>\n<li> In favorable conditions, it blooms with small white flowers and its pups grow on stems cascading from the plant.</li>\n</ul>",
    "tags": [
      "air-purifying",
      "b2g1",
      "buy3",
      "featured",
      "flash",
      "low-light",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "41372685828228",
        "title": "Small / GroPot / Mocca",
        "price": 249,
        "compareAtPrice": 249,
        "available": true,
        "sku": "NUPL0002"
      },
      {
        "id": "41372686024836",
        "title": "Small / Krish / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002KIY"
      },
      {
        "id": "41372686057604",
        "title": "Small / Krish / White",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002KWT"
      },
      {
        "id": "41372686155908",
        "title": "Small / Krish / Brown",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002KBN"
      },
      {
        "id": "51200165773444",
        "title": "Small / Kyoto / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002QMC"
      },
      {
        "id": "51200165740676",
        "title": "Small / Kyoto / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002QIY"
      },
      {
        "id": "51200165806212",
        "title": "Small / Kyoto / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002QTC"
      },
      {
        "id": "51841200685188",
        "title": "Small / Yoda / Mocca",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002YMC"
      },
      {
        "id": "51841200717956",
        "title": "Small / Yoda / Ivory",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002YIY"
      },
      {
        "id": "51841200750724",
        "title": "Small / Yoda / Terracotta",
        "price": 299,
        "compareAtPrice": 350,
        "available": true,
        "sku": "NUPL0002YTC"
      },
      {
        "id": "41372686286980",
        "title": "Small / Lagos / Mocca",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0002LMC"
      },
      {
        "id": "41372686254212",
        "title": "Small / Lagos / White",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0002LWT"
      },
      {
        "id": "41372686221444",
        "title": "Small / Lagos / Grey",
        "price": 349,
        "compareAtPrice": 400,
        "available": true,
        "sku": "NUPL0002LGY"
      },
      {
        "id": "51181935722628",
        "title": "Small / Roma / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002RWT"
      },
      {
        "id": "51181935755396",
        "title": "Small / Roma / Grey",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002RGR"
      },
      {
        "id": "51181935788164",
        "title": "Small / Roma / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002RPC"
      },
      {
        "id": "51181935820932",
        "title": "Small / Roma / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002RCB"
      },
      {
        "id": "51181935853700",
        "title": "Small / Roma / Magenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002RMJ"
      },
      {
        "id": "41575125942404",
        "title": "Small / Diamond / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0002DWT"
      },
      {
        "id": "51181935493252",
        "title": "Small / Diamond / Peach",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002DPC"
      },
      {
        "id": "51181935526020",
        "title": "Small / Diamond / Carton Brown",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002DCB"
      },
      {
        "id": "51181935558788",
        "title": "Small / Diamond / Magenta",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002DMJ"
      },
      {
        "id": "51841200783492",
        "title": "Small / Table Top / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0002TWT"
      },
      {
        "id": "41372686647428",
        "title": "Small / Spiro / White",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002SWT"
      },
      {
        "id": "41372686778500",
        "title": "Small / Spiro / Pink",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0002SP"
      },
      {
        "id": "41372686614660",
        "title": "Small / Spiro / Black",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002SBK"
      },
      {
        "id": "41372686680196",
        "title": "Small / Spiro / Cadet Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0002SCB"
      },
      {
        "id": "41372686712964",
        "title": "Small / Spiro / Sky Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": false,
        "sku": "NUPL0002SSB"
      },
      {
        "id": "41372686745732",
        "title": "Small / Spiro / Turquoise Blue",
        "price": 549,
        "compareAtPrice": 650,
        "available": true,
        "sku": "NUPL0002STQ"
      },
      {
        "id": "51181935591556",
        "title": "Small / Grail / White",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0002GWT"
      },
      {
        "id": "51181935624324",
        "title": "Small / Grail / Peach",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0002GPC"
      },
      {
        "id": "51181935657092",
        "title": "Small / Grail / Carton Brown",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0002GCB"
      },
      {
        "id": "51181935689860",
        "title": "Small / Grail / Magenta",
        "price": 449,
        "compareAtPrice": 749,
        "available": false,
        "sku": "NUPL0002GMJ"
      },
      {
        "id": "41372687007876",
        "title": "Medium / GroPot / Ivory",
        "price": 399,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUPL0488"
      },
      {
        "id": "41392136126596",
        "title": "Medium / Krish / Ivory",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0488KIY"
      },
      {
        "id": "41392181870724",
        "title": "Medium / Krish / Yellow",
        "price": 499,
        "compareAtPrice": 600,
        "available": true,
        "sku": "NUPL0488KYL"
      },
      {
        "id": "41393153245316",
        "title": "Medium / Grail / Peach",
        "price": 799,
        "compareAtPrice": 950,
        "available": false,
        "sku": "NUPL0488GPC"
      },
      {
        "id": "41392139042948",
        "title": "Medium / Venice / White",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0488VWT"
      },
      {
        "id": "41392137207940",
        "title": "Medium / Venice / Black",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0488VBK"
      },
      {
        "id": "41392137175172",
        "title": "Medium / Venice / Light Grey",
        "price": 799,
        "compareAtPrice": 999,
        "available": false,
        "sku": "NUPL0488VLG"
      }
    ]
  },
  {
    "id": "6940997746820",
    "handle": "spinach-seeds-palak",
    "title": "Spinach Seeds (Palak)",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 144,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_25_360fa6f2-8f3a-4196-a7b0-fe0ab4c3e742.jpg?v=1792266569",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_25_360fa6f2-8f3a-4196-a7b0-fe0ab4c3e742.jpg?v=1792266569",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_22_71dd5d95-478e-43fc-8639-926412700224.jpg?v=1792266553",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_24_bb2c042a-418a-4fc0-aa45-388ccfb73250.jpg?v=1792266539",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_25_4bdd8264-1557-4817-9c9e-a4bc03a585ab.jpg?v=1792266522",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_25_a660fa2d-17d5-472e-8f04-10354b3c53a0.jpg?v=1792266508",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_23_f916f181-5cbc-4687-a6be-e12701110e5a.jpg?v=1792266495",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_23_387ad790-74e6-4ed0-bdc3-371dc511c2e7.jpg?v=1792756452"
    ],
    "descriptionHtml": "<p>Spinach is a nutrient-packed leafy green. It's a favourite in Indian home gardens. Fast to grow and easy to care for.</p><ul>\n<li>Rich in iron, protein, vitamins, and minerals</li>\n<li>One of the easiest ways to eat cleaner, every day</li>\n<li>Toss it into smoothies, salads, or your everyday dal and sabji</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free spinach all year round</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 106</p>",
    "tags": [
      "Aroma",
      "featured",
      "Harvest",
      "retail-store",
      "Sprout",
      "top-200-sku",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859352694916",
        "title": "8 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO321"
      },
      {
        "id": "40859352727684",
        "title": "100 gm",
        "price": 195,
        "compareAtPrice": 195,
        "available": true,
        "sku": "NUVSO323"
      },
      {
        "id": "40859352760452",
        "title": "250 gm",
        "price": 315,
        "compareAtPrice": 315,
        "available": false,
        "sku": "NUVSO324"
      }
    ]
  },
  {
    "id": "6940812836996",
    "handle": "cherry-tomato-50-seeds",
    "title": "Cherry Tomato Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 149,
    "compareAtPrice": 175,
    "discountPercent": 15,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 96,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_s76foTgl8e.jpg?v=1788875809",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_s76foTgl8e.jpg?v=1788875809",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_2.jpg?v=1792741798",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_2_1ecc20a7-f824-4e3f-b45a-2853593ee952.jpg?v=1792741820",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_3.jpg?v=1792741829",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_2.jpg?v=1792741844",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_4_98b3516c-c8c1-45ee-9ea8-b115f07fd181.jpg?v=1792741858",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_8_12189fc9-8259-4db8-b918-8656d33ef52a.jpg?v=1792741873"
    ],
    "descriptionHtml": "<p>Cherry tomatoes are compact, prolific fruiters. A favourite for Indian home gardens. Sweet, colourful, and rewarding to grow in pots or grow bags.</p><ul>\n<li>Rich in vitamin C, vitamin A, potassium, and antioxidants like lycopene</li>\n<li>One of the easiest ways to add fresh, homegrown flavour to your daily meals</li>\n<li>Toss it into salads, pastas, chutneys, or snack on them straight off the vine</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free cherry tomatoes all season long</li>\n</ul>",
    "tags": [
      "Aroma",
      "best",
      "Harvest",
      "retail-store",
      "top-200-sku",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40858922320004",
        "title": "Default Title",
        "price": 149,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO331"
      }
    ]
  },
  {
    "id": "6940980510852",
    "handle": "cosmos-mix-seeds",
    "title": "Cosmos Mix Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 180,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_1lOHNUQr4r.jpg?v=1788609629",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_1lOHNUQr4r.jpg?v=1788609629",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_e418eca6-357a-4120-b422-1f68603d1a67.jpg?v=1788609631",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_5b50d8b8-2adf-4ca1-ade7-9e7c455ad657.jpg?v=1788609643",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_193fd796-5e3d-4042-9924-54a89311f8c7.jpg?v=1788609655",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_c1f8e2e2-124d-4c63-b64e-1bbbd92dff1e.jpg?v=1788609673",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_b6145c6b-8fba-49a0-8d68-9b37aae2657f.jpg?v=1788609689"
    ],
    "descriptionHtml": "<p>Cosmos Mix is a light, airy flowering plant. It's known for its delicate, daisy-like blooms. An easy, fuss-free way to add movement and colour to Indian gardens.</p><ul>\n<li>Produces delicate, daisy-like blooms in pink, red, white, and magenta</li>\n<li>One of the easiest and fastest-flowering annuals, great for beginners</li>\n<li>Great for borders, pots, garden beds, and cut flower arrangements</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 135</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41278624399492",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO033"
      },
      {
        "id": "41278624432260",
        "title": "25 GM",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": true,
        "sku": "NUFSO034"
      }
    ]
  },
  {
    "id": "6940007268484",
    "handle": "coriander-seeds",
    "title": "Coriander Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 197,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_12_46b9a6ee-e35d-4d1c-a568-d349062cbcae.jpg?v=1792268670",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_12_46b9a6ee-e35d-4d1c-a568-d349062cbcae.jpg?v=1792268670",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_9_e0e81ee1-49eb-4a72-ab07-746f040fded2.jpg?v=1792268654",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_11_e45009b7-ac76-4754-b9e8-78c1ea93b651.jpg?v=1792268638",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_12_18f06dd6-6f6e-437a-b1c8-8481a3272345.jpg?v=1792268622",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_12.jpg?v=1792268607",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_10.jpg?v=1792268595",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_10_7a7e0ea7-6ebb-4be8-9e58-0f28d9b3e7a8.jpg?v=1792741948"
    ],
    "descriptionHtml": "<p>Coriander is a fast-growing, aromatic herb. It's a staple in Indian home gardens. Easy to grow, and even easier to use fresh from the pot.</p><ul>\n<li>Rich in vitamin A, vitamin C, vitamin K, and antioxidants</li>\n<li>One of the easiest herbs to keep fresh at home, all year round</li>\n<li>Toss it into chutneys, curries, salads, or garnish your everyday dal and sabji</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free coriander whenever you need it</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 120</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "top-200-sku",
      "trend",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40856726667396",
        "title": "3 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO146"
      },
      {
        "id": "40856726700164",
        "title": "100 gm",
        "price": 195,
        "compareAtPrice": 195,
        "available": false,
        "sku": "NUVSO148"
      },
      {
        "id": "40856726732932",
        "title": "250 gm",
        "price": 315,
        "compareAtPrice": 315,
        "available": false,
        "sku": "NUVSO149"
      }
    ]
  },
  {
    "id": "6941005447300",
    "handle": "petunia-mix-seeds",
    "title": "Petunia Mix Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 118,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_KLJ8edYkqp.jpg?v=1788869670",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_KLJ8edYkqp.jpg?v=1788869670",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_2_16411f03-5121-4056-a531-ec4742c29415.jpg?v=1788869670",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_6cfd55a3-3043-4140-932a-a517948f8601.jpg?v=1788869688",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_9df21011-6c6a-4791-991b-778f85a0150d.jpg?v=1788869698",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_db77ef51-25b2-4d28-9d08-78543c6fe980.jpg?v=1788869715",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_ab9d2985-fa29-4fd8-9782-b881d6679eee.jpg?v=1788869731"
    ],
    "descriptionHtml": "<p>Petunia Mix is a trailing, free-flowering annual. It's known for its trumpet-shaped blooms in bright colours. A gorgeous choice for hanging baskets and balconies.</p><ul>\n<li>Produces trumpet-shaped blooms in pink, purple, red, white, and bicolour patterns</li>\n<li>One of the best flowers for continuous colour through the season</li>\n<li>Great for hanging baskets, window boxes, pots, and garden borders</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 13044</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store",
      "top-200-sku",
      "trend"
    ],
    "variants": [
      {
        "id": "40859374616708",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO065"
      }
    ]
  },
  {
    "id": "6940979429508",
    "handle": "marigold-african-double-seeds",
    "title": "Marigold African Double Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 145,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_1lOlX1Wr4r.jpg?v=1788616948",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_1lOlX1Wr4r.jpg?v=1788616948",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_4094cc0d-f145-411a-b715-c09de9b7d564.jpg?v=1788616952",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_76abea99-ef55-4c0f-8af0-037908993d57.jpg?v=1788616963",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_14ab29dd-e9f5-4197-ae4d-e7745fe79c5b.jpg?v=1788616976",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_edcc74d6-b821-468a-9751-1b62e678f100.jpg?v=1788616995",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_5a8a3965-f5de-4caa-8521-9d6100538b31.jpg?v=1788617009"
    ],
    "descriptionHtml": "<p>Marigold African Double is a tall, robust flowering plant. It's known for its large, fully double blooms. A festive favourite in Indian gardens.</p><ul>\n<li>Produces large, dense blooms in warm shades of yellow, orange, and gold</li>\n<li>A classic choice for festivals, temple offerings, rangoli, and garlands</li>\n<li>Great for borders, pots, garden beds, and cut flowers</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 295</p>",
    "tags": [
      "Aroma",
      "featured",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41257037856900",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO057"
      },
      {
        "id": "41257037889668",
        "title": "25 gm",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": false,
        "sku": "NUFSO058"
      }
    ]
  },
  {
    "id": "6940995485828",
    "handle": "tomato-seeds",
    "title": "Tomato Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 217,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_26_1682c8a6-4ccc-46c9-9a0b-19be38544d45.jpg?v=1792266884",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_26_1682c8a6-4ccc-46c9-9a0b-19be38544d45.jpg?v=1792266884",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_23_b1dff92e-0ac5-4010-a1ad-1aa4720814ef.jpg?v=1792266867",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_25_c7f7107b-5c59-458d-aafa-9eccc0910a69.jpg?v=1792266856",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_26_835963cb-3c86-4be4-bb60-e5c425b9555f.jpg?v=1792266837",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_26_a929e021-831c-407d-8b1a-0d941a1560a2.jpg?v=1792266823",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_24_7d697697-1464-41f2-9a97-34acc2c5ccb9.jpg?v=1792266809",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_24_c8533313-2184-477e-a02c-444b497a8843.jpg?v=1792756514"
    ],
    "descriptionHtml": "<p>Tomato is one of the most popular and versatile vegetables to grow at home. A rewarding addition to any Indian kitchen garden.</p><ul>\n<li>Rich in vitamin C, vitamin A, potassium, and antioxidants like lycopene</li>\n<li>One of the easiest ways to add fresh, homegrown flavour to your daily cooking</li>\n<li>Toss it into curries, salads, chutneys, or use it as the base for everyday sabzi</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free tomatoes all season long</li>\n</ul>",
    "tags": [
      "Aroma",
      "best",
      "Harvest",
      "retail-store",
      "top-200-sku",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859342372996",
        "title": "600 mg",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO336"
      },
      {
        "id": "40859342405764",
        "title": "25 gm",
        "price": 300,
        "compareAtPrice": 300,
        "available": false,
        "sku": "NUVSO337"
      },
      {
        "id": "41318014288004",
        "title": "100 gm",
        "price": 1200,
        "compareAtPrice": 1200,
        "available": true,
        "sku": "NUVSO338"
      },
      {
        "id": "41365603123332",
        "title": "250 gm",
        "price": 2999,
        "compareAtPrice": 2999,
        "available": true,
        "sku": "NUVSO339"
      }
    ]
  },
  {
    "id": "6940800745604",
    "handle": "chrysanthemum-mix-250-seeds",
    "title": "Chrysanthemum Mix Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 279,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_tCbCZXJmZJ.jpg?v=1788609310",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_tCbCZXJmZJ.jpg?v=1788609310",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4.jpg?v=1788609319",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4.jpg?v=1788609337",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4.jpg?v=1788609353",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1.jpg?v=1788609373",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1.jpg?v=1788609387"
    ],
    "descriptionHtml": "<p>Chrysanthemum Mix is a hardy, festive flowering plant. It's loved in Indian gardens for its abundant blooms and long flowering season.</p><ul>\n<li>Produces bright, cheerful blooms in yellow, white, pink, orange, and bronze</li>\n<li>A classic choice for festive décor, temple offerings, and garden colour</li>\n<li>Great for borders, pots, garden beds, and cut flowers</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 335</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "40858896138372",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO025"
      }
    ]
  },
  {
    "id": "6940813459588",
    "handle": "italian-basil-1000-seeds",
    "title": "Italian Basil Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 79,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_lJiCmQUgv9.jpg?v=1789365294",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_lJiCmQUgv9.jpg?v=1789365294",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_99d944f7-ef76-4676-9d23-570eddfa217c.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_22f8bed9-78ed-4d4b-bd1d-ef2e2d8b222b.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_210a17e5-bdd7-4483-af9c-deddfe2159f4.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_5bea7d6a-0df9-4acb-a00c-463859558a01.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_897f80a0-f1dd-4ef5-a06c-ad00720f3f21.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_e20851a6-478a-4127-96aa-0e6e7c8d3225.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_8ae8460e-2873-40ad-9633-1f9bc6467a45.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/8_d845918f-9d0c-43f4-bb49-07e91c870c68.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Basil_25_gm.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_c4133d26-9869-4571-892c-0d281940aac9.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_1c998eca-fce3-4a5c-afef-8b025ce15e7f.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_690eda70-aad7-47d3-a043-581601096efa.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_86721c7f-3817-4b3d-b15d-ad7c23fb96ce.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_d0cbc695-fc82-42ba-909f-94a73077e781.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_6a031889-258f-4332-bd74-6f950e9cdab7.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_20c2bd52-b96d-43b8-8580-6d45701dd074.jpg?v=1756481494",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/8_31e8ccf2-9454-4339-9150-ec0abf3fe8a4.jpg?v=1756481494"
    ],
    "descriptionHtml": "<p>Italian Basil is a fragrant, fast-growing herb with large, glossy leaves and a sweet, peppery flavour, a staple in Italian cooking and surprisingly easy to grow at home.</p><ul>\n<li>Rich in vitamins A, C, and K, packed with antioxidants and anti-inflammatory properties</li>\n<li>Perfect for pesto, pasta, fresh salads, and more</li>\n<li>Thrives in India's warm weather, grows beautifully in pots, windowsills, and balconies</li>\n</ul>",
    "tags": [
      "Aroma",
      "best",
      "featured",
      "Fresh",
      "herb-seeds",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "41257035726980",
        "title": "1000 Seeds",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO006"
      },
      {
        "id": "41257035759748",
        "title": "25 gm",
        "price": 900,
        "compareAtPrice": 900,
        "available": false,
        "sku": "NUHSO007"
      }
    ]
  },
  {
    "id": "6941004791940",
    "handle": "dahlia-seeds",
    "title": "Dahlia Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 161,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_huKBj55vqL.jpg?v=1788609808",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_huKBj55vqL.jpg?v=1788609808",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_2a96bd0e-9cff-43b7-b9ca-f95d3997ab76.jpg?v=1788609810",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_999575a3-13c3-4c87-84ff-348a298be6dd.jpg?v=1788609822",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_bc4a839b-de32-4025-a9d9-1e518865c532.jpg?v=1788609835",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_b501f707-13ce-4882-9292-f291494b7cfb.jpg?v=1788609854",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_87b53f1a-6b78-48f9-a164-91b5c092c257.jpg?v=1788609869"
    ],
    "descriptionHtml": "<p>Dahlia is a striking flowering plant. It's known for its bold, layered blooms in a range of shapes and colours. A show-stopping choice for Indian winter gardens.</p><ul>\n<li>Produces vibrant blooms in red, pink, orange, yellow, and white</li>\n<li>A rewarding flower for gardeners who want big, eye-catching colour</li>\n<li>Great for pots, borders, garden beds, and cut flower arrangements</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 123</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41257039233156",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO035"
      },
      {
        "id": "41257039265924",
        "title": "25 gm",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": false,
        "sku": "NUFSO036"
      }
    ]
  },
  {
    "id": "6940994994308",
    "handle": "green-chilli-seeds",
    "title": "Green Chilli Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 264,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_17_8fa03364-332c-45ea-a350-8b71994803f3.jpg?v=1792266990",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_17_8fa03364-332c-45ea-a350-8b71994803f3.jpg?v=1792266990",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_14_8f9e54cd-9d3b-4223-9252-f848268682b2.jpg?v=1792266974",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_16_98b523c4-bfa7-4e38-ba72-9856970f75f9.jpg?v=1792266960",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_17_17c68dcf-402a-4e27-ad53-c39169a6c5d5.jpg?v=1792266943",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_17_feb3f91d-ae6f-426e-ad1e-b2e5bc25e23a.jpg?v=1792266927",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_15_b875c56a-2519-479e-963d-e354997687d5.jpg?v=1792266913",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_15_3d29310c-6740-4574-9ad3-8cf0c6563e77.jpg?v=1792742114"
    ],
    "descriptionHtml": "<p>Green Chilli is a hot, hardy vegetable. It's a kitchen staple in almost every Indian home. Easy to grow, and productive for months once established.</p><ul>\n<li>Rich in vitamin C, vitamin A, and capsaicin</li>\n<li>One of the easiest ways to add heat and flavour to daily cooking</li>\n<li>Toss it into curries, chutneys, tadka, or slice it fresh as a side</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free chillies all season long</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 170</p>",
    "tags": [
      "Aroma",
      "Birthday",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41257032089732",
        "title": "500 mg",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO141"
      },
      {
        "id": "41257032122500",
        "title": "25 gm",
        "price": 300,
        "compareAtPrice": 300,
        "available": false,
        "sku": "NUVSO142"
      },
      {
        "id": "41320245231748",
        "title": "100 gm",
        "price": 480,
        "compareAtPrice": 480,
        "available": true,
        "sku": "NUVSO143"
      },
      {
        "id": "41365602009220",
        "title": "250 gm",
        "price": 990,
        "compareAtPrice": 990,
        "available": false,
        "sku": "NUVSO144"
      }
    ]
  },
  {
    "id": "6940806578308",
    "handle": "broccoli-100-seeds",
    "title": "Broccoli Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 78,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_8_dfa9e3b4-78e3-4ed4-939a-21ae7311a5ae.jpg?v=1792268369",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_8_dfa9e3b4-78e3-4ed4-939a-21ae7311a5ae.jpg?v=1792268369",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_5_bc96c729-650e-4ed5-90ee-70c0ba1d61dc.jpg?v=1792268354",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_7_11236329-1ea4-463f-835a-bddc5aa9ba63.jpg?v=1792268340",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_8_326ff610-cf70-4122-9e90-6edf606660f6.jpg?v=1792268323",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_8_e807f2fb-7c3b-45d0-8ad2-04c211765842.jpg?v=1792268309",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_6_0a1e6080-cb8e-447a-9666-ff27f79d3749.jpg?v=1792268296",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_4_36f7353a-8500-400c-bfd7-4103504b6991.jpg?v=1792734774"
    ],
    "descriptionHtml": "<p>Broccoli is a cool-season vegetable. It's packed with nutrition and a great addition to Indian home gardens. Rewarding to grow and easy to care for once established.</p><ul>\n<li>Rich in fibre, vitamin C, vitamin K, and antioxidants</li>\n<li>One of the best ways to add a superfood to your daily diet</li>\n<li>Toss it into stir-fries, soups, salads, or steam it as a simple side</li>\n<li>Grow healthy, chemical-free broccoli all season long with Ugaoo's Organic Veggie Mix Soil.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 120</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "Sprout",
      "top-200-sku",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40858907377796",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO091"
      }
    ]
  },
  {
    "id": "6940992077956",
    "handle": "fenugreek-seeds-methi",
    "title": "Fenugreek Seeds (Methi)",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 199,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_15_828af6ec-9c51-4106-ac1f-197a74ed1378.jpg?v=1792267528",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_15_828af6ec-9c51-4106-ac1f-197a74ed1378.jpg?v=1792267528",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_12_aa8c78f3-730f-49d4-ac55-3f4665c01c60.jpg?v=1792267512",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_14_58f68c6c-b269-4113-b701-4b3f27b9a36e.jpg?v=1792267500",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_15.jpg?v=1792267483",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_15.jpg?v=1792267467",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_13.jpg?v=1792267454",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_14_0b71d97b-9ff0-4b70-b559-3c3806d0c8af.jpg?v=1792742066"
    ],
    "descriptionHtml": "<p>Methi is the most useful herb in any Indian kitchen and one of the fastest to grow at home. Sow once and you can harvest in under a month.</p><ul>\n<li>Rich in iron, protein, fibre, and vitamins A, C, and K.</li>\n<li>One of the fastest-growing kitchen herbs for Indian homes.</li>\n<li>Use fresh leaves in parathas, methi sabzi, dal, and chutneys.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free methi whenever you need it.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 57</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "Sprout",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859336343684",
        "title": "5 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO181"
      },
      {
        "id": "40859336376452",
        "title": "100 gm",
        "price": 195,
        "compareAtPrice": 195,
        "available": false,
        "sku": "NUVSO183"
      },
      {
        "id": "40859336409220",
        "title": "250 gm",
        "price": 315,
        "compareAtPrice": 315,
        "available": true,
        "sku": "NUVSO184"
      }
    ]
  },
  {
    "id": "6941004988548",
    "handle": "aster-mix-seeds",
    "title": "Aster Mix Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 56,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_UPRjztAwny.jpg?v=1788616289",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_UPRjztAwny.jpg?v=1788616289",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_ada2d09d-a162-42f6-8034-60cb81f58c44.jpg?v=1788616290",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_99c71b5f-75a8-4561-8e68-06bcf8abf856.jpg?v=1788616304",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_42a62217-5a6a-4c34-8f29-68208d832635.jpg?v=1788616316",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_0ed92de5-1234-490a-8f49-9fd76c652d7f.jpg?v=1788616337",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_7375c696-6996-441b-8013-1fed396cb5b4.jpg?v=1788616352"
    ],
    "descriptionHtml": "<p>Aster Mix is a classic cool-season flower that brings vibrant, daisy-like blooms to Indian gardens through the winter months. Wonderful for festive occasions, pots, and cut flowers.</p><ul>\n<li>Bright blooms in pink, purple, red, white, and blue with a cheerful daisy form.</li>\n<li>Long flowering season through the cool months; great for festive décor.</li>\n<li>Excellent as cut flowers with a long vase life.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long.</li>\n</ul><p>Number of seeds per gram (aprox): 580</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41278617878660",
        "title": "1 GM",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO009"
      },
      {
        "id": "41278617911428",
        "title": "25 GM",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": true,
        "sku": "NUFSO010"
      }
    ]
  },
  {
    "id": "6940981231748",
    "handle": "portulaca-mix-seeds",
    "title": "Portulaca Mix Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 242,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_iGVDacU3uK.jpg?v=1788616481",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_iGVDacU3uK.jpg?v=1788616481",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_f6eda9ce-f0c8-47a4-bc54-29504a58779e.jpg?v=1788616486",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_9cacb513-d2b5-43cc-8200-d5d588f69e07.jpg?v=1788616497",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_549f8f3e-7228-4c08-ae8c-db7f6f339f24.jpg?v=1788616513",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_74672452-4b4a-4c6a-b265-1689f53de5ec.jpg?v=1788616527",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_b9e7047e-8724-41da-972b-3d1ed848d829.jpg?v=1788616541"
    ],
    "descriptionHtml": "<p>Portulaca Mix is a low-growing, heat-loving annual. It's known for its vibrant, rose-like blooms that open wide in full sun. A tough, cheerful choice for Indian summer gardens.</p><ul>\n<li>Produces bright blooms in pink, red, orange, yellow, and white</li>\n<li>Thrives in heat and needs very little care once established</li>\n<li>Great for borders, hanging pots, rock gardens, and sunny balconies</li>\n<li>Grow it organically in Ugaoo's Pot-o-Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 11420</p>",
    "tags": [
      "Aroma",
      "best",
      "featured",
      "flower-seed",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "40859297742980",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO071"
      }
    ]
  },
  {
    "id": "6940907536516",
    "handle": "red-capsicum-50-seeds",
    "title": "Red Capsicum Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 65,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_8aqGRQhIrU.jpg?v=1788868960",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_8aqGRQhIrU.jpg?v=1788868960",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_2.jpg?v=1788868912",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_13_38f798ea-29e5-4c8e-9e2d-52d5528967bc.jpg?v=1792756259",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_14_e49bed2b-e415-45f8-a99f-fa69b7fda0e6.jpg?v=1792756276",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_b4910505-c140-4a31-9214-7f921a167b39.jpg?v=1788869023",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_15_2f01fcee-61a5-4f23-abfc-268c18e1148e.jpg?v=1792756287",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70.jpg?v=1788869069"
    ],
    "descriptionHtml": "<p>Red Capsicum is a sweet, colourful vegetable. It's a vibrant, rewarding addition to Indian home gardens. Slow to start, but productive once established.</p><ul>\n<li>Rich in vitamin C, vitamin A, and antioxidants</li>\n<li>One of the best ways to add sweetness and colour to your daily cooking</li>\n<li>Toss it into sabzi, stir-fries, salads, or stuff and roast it</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free capsicum all season long</li>\n</ul>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "top-200-sku",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859122303108",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO376"
      }
    ]
  },
  {
    "id": "6940997484676",
    "handle": "lettuce-iceberg-seeds-round",
    "title": "Lettuce Iceberg Seeds (Round)",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 104,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_20.jpg?v=1792266676",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_20.jpg?v=1792266676",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_17_1d4a68ce-5a6e-4ffa-8aed-0d8db03ba782.jpg?v=1792266656",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_19.jpg?v=1792266646",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_20.jpg?v=1792266628",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_20_f3414dc5-7e80-4451-a265-e9005f9bb114.jpg?v=1792266614",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_18_b6cb7d9b-18ca-47cc-a58b-8c3f9d511072.jpg?v=1792266596",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_18_3b4a9f1e-dc5c-4372-aca8-340f3b7e1ae3.jpg?v=1792742310"
    ],
    "descriptionHtml": "<p>Iceberg Lettuce is a crisp, refreshing cool-season vegetable that grows beautifully in Indian winters. Light to grow, rewarding to harvest, and endlessly useful in the kitchen.</p><ul>\n<li>Rich in vitamin K, vitamin A, folate, and water content.</li>\n<li>The freshest way to enjoy crispy salads, rolls, and wraps at home.</li>\n<li>Grows well in pots, grow bags, and raised beds in any Indian home garden.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free lettuce all winter long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 950</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859351646340",
        "title": "2 gm",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO216"
      },
      {
        "id": "40859351679108",
        "title": "25 gm",
        "price": 750,
        "compareAtPrice": 750,
        "available": true,
        "sku": "NUVSO217"
      }
    ]
  },
  {
    "id": "6941002858628",
    "handle": "poppy-mix-seeds",
    "title": "Poppy Mix Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 207,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_gO3EtFgSXO.jpg?v=1788869760",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_gO3EtFgSXO.jpg?v=1788869760",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_2_11b1ca39-87c2-41e8-a6a0-a0364525cd47.jpg?v=1788868934",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_0d06b8b7-1610-404f-81be-e24cea38167a.jpg?v=1788869484",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_b5b20af4-e159-4c07-b4a5-3ad9f7529a9e.jpg?v=1788869610",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_6d3f8971-96c0-48c1-8c9b-e7f5c8af08df.jpg?v=1788869472",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_3204878f-e5b3-4fdd-b65d-e20c303cbfbe.jpg?v=1788869228"
    ],
    "descriptionHtml": "<p>Poppies are one of the most beautiful cool-season flowers you can grow in India. Silky, vivid, and surprisingly easy, they reward you with delicate blooms through the winter months.</p><ul>\n<li>Silky, paper-thin blooms in red, pink, orange, white, and purple in a cheerful mix.</li>\n<li>A cool-season beauty that thrives in Indian winters and tolerates mild neglect.</li>\n<li>Great for borders, pots, window boxes, and as cut flowers.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free poppies all winter long.</li>\n</ul><p>Number of seeds per gram (aprox): 9511</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859367997572",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO069"
      }
    ]
  },
  {
    "id": "6940804251780",
    "handle": "lettuce-romaine-seeds-long",
    "title": "Lettuce Romaine Seeds (Long)",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 277,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_YM8JLSDWeC.jpg?v=1788876526",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_YM8JLSDWeC.jpg?v=1788876526",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_c4cd0045-ea99-45af-8544-ca6052ba84e1.jpg?v=1788876495",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_7_d67e101b-910e-4f2b-8b32-215e5b20ae47.jpg?v=1792742358",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_8.jpg?v=1792742324",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_4436a494-094f-4ee1-bea6-9256492af026.jpg?v=1788877094",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_9_e7b99f57-095b-4b8a-9541-19c412ebb0fb.jpg?v=1792742336",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_52ea2b46-9b37-4ba1-b812-016465b82700.jpg?v=1788876454"
    ],
    "descriptionHtml": "<p>Romaine Lettuce is the crisp, upright salad green that holds its texture and flavour better than any other variety. Grows beautifully in Indian winters and looks as good as it tastes.</p><ul>\n<li>Tall, upright heads with crisp outer leaves and a sweet tender heart.</li>\n<li>Rich in vitamin K, vitamin A, and folate.</li>\n<li>The go-to lettuce for Caesar salads, sandwich wraps, fresh bowls, and everyday salads.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free salad greens all winter long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 950</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41130277273732",
        "title": "2 GM",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO221"
      },
      {
        "id": "41130277306500",
        "title": "25 GM",
        "price": 750,
        "compareAtPrice": 750,
        "available": true,
        "sku": "NUVSO222"
      }
    ]
  },
  {
    "id": "6940999745668",
    "handle": "tulsi-seeds-holy-basil",
    "title": "Tulsi Seeds (Holy Basil)",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 220,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_nVBVlsKYQD.jpg?v=1788609117",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_nVBVlsKYQD.jpg?v=1788609117",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_2.jpg?v=1788609118",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_2.jpg?v=1788609137",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard5_1.jpg?v=1788609151",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_2-02_1.jpg?v=1788609164",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-07_1_0b4eddf6-9fc3-400e-826e-97e28623e00b.jpg?v=1788609179"
    ],
    "descriptionHtml": "<p>Tulsi is a sacred, aromatic herb. It's deeply rooted in Indian homes. Easy to grow, and valued for its medicinal and spiritual significance.</p><ul>\n<li>Rich in antioxidants and essential oils, and known for its immunity-boosting properties</li>\n<li>One of the easiest ways to bring a daily wellness ritual into your home</li>\n<li>Use it in teas (kadha), fresh chewing, or as part of your daily puja</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free tulsi all year round</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 4000</p>",
    "tags": [
      "Aroma",
      "best",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859358986372",
        "title": "2 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO341"
      },
      {
        "id": "40859359019140",
        "title": "25 gm",
        "price": 600,
        "compareAtPrice": 600,
        "available": false,
        "sku": "NUVSO342"
      }
    ]
  },
  {
    "id": "6940994699396",
    "handle": "capsicum-seeds",
    "title": "Capsicum Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 84,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_9_9b82dcf4-837a-4c0e-a671-2c5fe6362933.jpg?v=1792267096",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_9_9b82dcf4-837a-4c0e-a671-2c5fe6362933.jpg?v=1792267096",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_6_53082e9d-d1d1-43f6-a4cf-011ac5b301a8.jpg?v=1792267075",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_8_b7b33c4f-0b25-41be-8cad-96353391769e.jpg?v=1792267066",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_9_4ae7dd2b-9fdb-4fd9-8dd6-25eccd1ec5b4.jpg?v=1792267049",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_9_f1652b7e-04a5-48ff-b4b5-d49099f98728.jpg?v=1792267034",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_7_5233673c-640d-454e-b326-0093dc0856b3.jpg?v=1792267015",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_6_5341454d-6270-4903-b769-b623b4611d3a.jpg?v=1792734824"
    ],
    "descriptionHtml": "<p>Capsicum is a colourful, nutrient-rich vegetable. A rewarding addition to Indian home gardens. Slow to start, but productive once established.</p><ul>\n<li>Rich in vitamin C, vitamin A, and antioxidants</li>\n<li>One of the best ways to add crunch and colour to your daily cooking</li>\n<li>Toss it into sabzi, stir-fries, salads, or stuff and roast it</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free capsicum all season long</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 160</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859340800132",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO116"
      }
    ]
  },
  {
    "id": "6940872933508",
    "handle": "oregano-1500-seeds",
    "title": "Oregano Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 194,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_9Zc1qS2NYZ.jpg?v=1788868675",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_9Zc1qS2NYZ.jpg?v=1788868675",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_3e6c655f-91dd-48e9-b997-2f4ddb26c1de.jpg?v=1788868422",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_7594a82c-c42e-40dd-8fce-d320ba9f3c14.jpg?v=1788869087",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_363c83ee-69df-4ede-886f-b7e185b03436.jpg?v=1788868436",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_f4496f43-b690-4d93-9ce6-90ef0f94244d.jpg?v=1788869164",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_f196fc02-b6a4-42cf-b6e2-7357bbec0235.jpg?v=1788868456"
    ],
    "descriptionHtml": "<p>Oregano is a low-growing, richly aromatic herb. It's a favourite for Italian and Mediterranean-style home cooking. Hardy, compact, and easy to keep going.</p><ul>\n<li>Rich in antioxidants, vitamin K, and essential oils</li>\n<li>One of the easiest herbs to dry and store for later use</li>\n<li>Toss it into pastas, pizzas, salad dressings, or roasted vegetables</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free oregano all year round</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "40859042906244",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO026"
      }
    ]
  },
  {
    "id": "6940978839684",
    "handle": "calendula-seeds",
    "title": "Calendula Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 247,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_SyR2pn0Ub8.jpg?v=1788616767",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_SyR2pn0Ub8.jpg?v=1788616767",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_4df51250-f302-44c3-8230-3e5a98e4168b.jpg?v=1788616772",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_2227f145-f173-4b5e-9064-328a0d43fad1.jpg?v=1788616782",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_7b3e1a02-a7b7-474c-8a58-32dc73016540.jpg?v=1788616796",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_7662a4f3-572d-4124-8d0f-a3e91b6b087c.jpg?v=1788616813",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_11357ec9-6c26-40c5-94a9-f4eced53c5d3.jpg?v=1788616829"
    ],
    "descriptionHtml": "<p>Calendula, or Pot Marigold, is a bright, cheerful cool-season flower that blooms prolifically through Indian winters. The petals are edible, medicinal, and beautiful all at once.</p><ul>\n<li>Bright orange and yellow blooms that light up any balcony or garden through winter.</li>\n<li>Edible petals used fresh in salads, herbal teas, and natural skin remedies.</li>\n<li>A natural pest repellent; plant near vegetables to protect your kitchen garden.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all winter long.</li>\n</ul><p>Number of seeds per gram (aprox): 135</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41278616010884",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO013"
      },
      {
        "id": "41278616043652",
        "title": "25 GM",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": false,
        "sku": "NUFSO014"
      }
    ]
  },
  {
    "id": "6941007085700",
    "handle": "okra-seeds-lady-finger",
    "title": "Okra Seeds (Lady Finger)",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 56,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_22.jpg?v=1792266351",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_22.jpg?v=1792266351",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_19.jpg?v=1792266332",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_21.jpg?v=1792266317",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_22.jpg?v=1792265215",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_22.jpg?v=1792265202",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_20.jpg?v=1792265190",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_20_b150f849-1f7c-43b7-81d9-e9649161989c.jpg?v=1792749103"
    ],
    "descriptionHtml": "<p>Okra is a heat-loving vegetable. It's a summer staple in Indian home gardens. Vigorous, productive, and easy to grow once the weather warms up.</p><ul>\n<li>Rich in fiber, vitamin C, vitamin K, and folate</li>\n<li>One of the easiest summer vegetables to keep fresh at home</li>\n<li>Toss it into sabzi, curries, or fry it up as a crispy side</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free bhindi all season long</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 18</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859376615556",
        "title": "5 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO246"
      },
      {
        "id": "40859376648324",
        "title": "100 gm",
        "price": 270,
        "compareAtPrice": 270,
        "available": false,
        "sku": "NUVSO248"
      },
      {
        "id": "40859376681092",
        "title": "250 gm",
        "price": 540,
        "compareAtPrice": 540,
        "available": true,
        "sku": "NUVSO249"
      }
    ]
  },
  {
    "id": "6940984148100",
    "handle": "carnation-seeds",
    "title": "Carnation Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 199,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_5jwuPL4Kxe.jpg?v=1788609534",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_5jwuPL4Kxe.jpg?v=1788609534",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_d662e116-c3ea-48c3-9f8e-4300a84e5b91.jpg?v=1788609537",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_e5484fdd-3f7f-4420-8c36-dd6cc41a5b6d.jpg?v=1788609555",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_2d732a6a-f931-47d8-9c58-0f2ae4e43d82.jpg?v=1788609568",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_1746f6d6-be5f-4a26-af1d-326f956c4227.jpg?v=1788609581",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_4c0fef8a-2a8e-4f4f-a1dd-41e881bb0bbb.jpg?v=1788609595"
    ],
    "descriptionHtml": "<p>Carnation is an elegant, long-lasting flowering plant. It's valued for its ruffled, fragrant blooms. A beautiful addition to Indian winter gardens.</p><ul>\n<li>Produces pretty fragrant blooms in pink, red, white, and yellow</li>\n<li>Known for excellent vase life, making it a favourite for cut flowers and bouquets</li>\n<li>Great for pots, borders, garden beds, and gifting arrangements</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 1060</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859307999364",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO017"
      }
    ]
  },
  {
    "id": "6940965175428",
    "handle": "arugula-seeds-rocket-leaves",
    "title": "Arugula Seeds (Rocket Leaves)",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 138,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_8abv7STIrU_png.jpg?v=1788868418",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_8abv7STIrU_png.jpg?v=1788868418",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_2-02_5_5df56726-ea62-4836-8c97-efbc786b8d76.jpg?v=1788868469",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_ce27db11-f8be-4821-ab8a-15b5bd649c24.jpg?v=1788868621",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_a43fe1d4-234c-4f79-8228-25cf34c94d69.jpg?v=1788868864",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_c0b26e2e-b05b-4e14-9edc-4cbd0dc2a5b7.jpg?v=1788868784",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-07_5_bb7ebf24-3268-4ce0-9021-a62938bbd5d1.jpg?v=1788868798"
    ],
    "descriptionHtml": "<p>Arugula is a peppery, fast-growing salad green. It's a great way to add a bit of bite to home-grown greens. One of the quickest crops to go from seed to plate.</p><ul>\n<li>Rich in vitamin K, vitamin C, and folate</li>\n<li>One of the fastest greens to harvest, ready in just a few weeks</li>\n<li>Toss it into salads, sandwiches, pastas, or as a peppery garnish</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free arugula all year round</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859229552772",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO081"
      }
    ]
  },
  {
    "id": "6940991783044",
    "handle": "french-bean-seeds",
    "title": "French Bean Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 97,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_16_36600364-7334-4301-a53d-db5cfb31eb08.jpg?v=1792267636",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_16_36600364-7334-4301-a53d-db5cfb31eb08.jpg?v=1792267636",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_13_c75a4535-a338-4158-b8af-980085ac89f2.jpg?v=1792267619",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_15_f111d7bc-b892-4210-89e6-fa79515d68c4.jpg?v=1792267605",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_16.jpg?v=1792267591",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_16.jpg?v=1792267575",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_14.jpg?v=1792267555",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_15_0fe4752c-2ba3-4097-a2df-728274a98412.jpg?v=1792742081"
    ],
    "descriptionHtml": "<p>French Beans are a fast, rewarding vegetable and a wonderful addition to any Indian home garden. They grow quickly, produce generously, and taste best when picked young and tender.</p><ul>\n<li>Rich in protein, fibre, iron, and vitamins A, C, and K.</li>\n<li>One of the easiest ways to grow fresh protein at home.</li>\n<li>Toss into sabzi, soups, stir-fries, or steam as a simple side.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free beans all season long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 3</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41331650887812",
        "title": "10 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO191"
      },
      {
        "id": "41331650920580",
        "title": "100 gm",
        "price": 299,
        "compareAtPrice": 299,
        "available": true,
        "sku": "NUVSO193"
      },
      {
        "id": "41352102314116",
        "title": "250 gm",
        "price": 540,
        "compareAtPrice": 540,
        "available": true,
        "sku": "NUVSO194"
      }
    ]
  },
  {
    "id": "6940807921796",
    "handle": "parsley-1000-seeds",
    "title": "Parsley Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 155,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_1lytB9Rr4r_1.jpg?v=1789365308",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_1lytB9Rr4r_1.jpg?v=1789365308",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_66ad2812-060f-43e0-954d-2b524f023cab.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_d75d3bbc-9c91-4c6c-bdde-ba25add2b582.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_4d689d9b-a693-4213-9221-969cd0bc4a39.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_395fa12f-5f2c-4ba5-abe3-0961b20403d6.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_2fd1e1a4-0355-42c8-a746-c874185a0f1d.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_5439edb6-fe08-449b-8638-b7f658ea8bb3.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_1151e283-ba2a-476f-baab-bfac7a856b98.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/8_151eed70-5f48-4a15-a1a1-5505df66c033.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Parsley_25_gm.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_cd1e3cb6-d23b-46b6-a088-1761cb05a70b.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_2172771e-ad30-4e48-b392-516333f3fcc6.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_18b7e38f-87dd-4c32-a05c-5ddbd9e1cf9d.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_1e4a351f-90c1-41e2-a0d7-acceb917537b.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_0479c95a-6181-4b1d-b9d0-554d1fd62e08.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_50200b05-e624-4ad4-a70f-afca4d9287a5.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_7209e58b-ff34-47fb-afd5-8d66e1f70533.jpg?v=1756484921",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/8_a471c14b-3fc7-4905-8671-b49475390fcf.jpg?v=1756484921"
    ],
    "descriptionHtml": "Parsley is that superhero that goes well not only as garnishing but also as a flavour enhancing addition to your culinary experiments. You will find Parsley in the list of ingredients in numerous recipes for soups, salads and main course meals. Now, parsley has a great flavour profile but it is also nutritious, which makes it great for those who are conscious of eating a balanced meal.<p><strong>Approx. seeds per gram:</strong> 590</p>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41257036873860",
        "title": "1 gm",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO271"
      },
      {
        "id": "41257036906628",
        "title": "25 gm",
        "price": 750,
        "compareAtPrice": 750,
        "available": true,
        "sku": "NUVSO272"
      }
    ]
  },
  {
    "id": "6941005152388",
    "handle": "zinnia-double-mix-seeds",
    "title": "Zinnia Double Mix Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 186,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_eICI4mhdqL.jpg?v=1788601890",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_eICI4mhdqL.jpg?v=1788601890",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03.jpg?v=1788601893",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04.jpg?v=1788602070",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5.jpg?v=1788602024",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08.jpg?v=1788601904",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09.jpg?v=1788602113"
    ],
    "descriptionHtml": "<p>Zinnia Double is a tall, vibrant annual known for its large, fully double blooms. A favourite for adding bold, long-lasting colour to Indian home gardens.</p><ul>\n<li>Produces large, dense, multi-layered blooms in a mix of vivid shades - red, pink, orange, yellow, and purple</li>\n<li>A fast, rewarding flower for beginners and experienced gardeners alike</li>\n<li>Great for borders, pots, garden beds, and cut flower arrangements</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free, flowering all season long</li>\n</ul><p>Number of seeds per gram (aprox): 159</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41257040150660",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO091"
      },
      {
        "id": "41257040183428",
        "title": "25 gm",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": true,
        "sku": "NUFSO092"
      }
    ]
  },
  {
    "id": "6941000138884",
    "handle": "gypsophila-seeds",
    "title": "Gypsophila Seeds",
    "category": "seeds",
    "subCategory": "seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 80,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_Lw3SRyWswO-Recovered.jpg?v=1790250869",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_Lw3SRyWswO-Recovered.jpg?v=1790250869"
    ],
    "descriptionHtml": "World famous as the wispy dreamy \"Baby's Breath\", these darlings will turn your garden into a wonderland. A memeber of the carnation family, gypsphila flowers profusely with little intervention and can thrive with almost any other plant. Give it a sandy patch of land with partial shade that doesn't get too much wind to break its tiny blooms.<p>Number of seeds per gram (aprox): 7256</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859359281284",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO043"
      }
    ]
  },
  {
    "id": "10108769992836",
    "handle": "peace-lily-large-spathiphyllum-sensation",
    "title": "Peace Lily Large (Spathiphyllum Sensation)",
    "category": "plants",
    "subCategory": "indoor-plants",
    "price": 1449,
    "compareAtPrice": 1999,
    "discountPercent": 28,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 146,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/A_image_18_bc7de9bc-a0b0-4f19-99df-8e3e0e94b39b.jpg?v=1792223660",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/A_image_18_bc7de9bc-a0b0-4f19-99df-8e3e0e94b39b.jpg?v=1792223660",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_2.jpg?v=1792223562",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_3.jpg?v=1792223517",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_4.jpg?v=1792223533",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_5.jpg?v=1792223593",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_6.jpg?v=1792223575",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_7.jpg?v=1792223638",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_8.jpg?v=1792223621",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_9.jpg?v=1792223608",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Sensation_Peace_Lily_10.jpg?v=1792223551"
    ],
    "descriptionHtml": "<p dir=\"ltr\">The Large Peace Lily (Spathiphyllum Sensation) is elegance and calm in plant form. With lush, green leaves and graceful white blooms, it instantly brightens up living rooms, bedrooms, or office corners. Known as one of the best natural air purifiers, this large Peace Lily not only uplifts your décor but also helps you breathe fresher, cleaner air every day. Despite its grand size, it’s easy to care for - thriving in low light and needing only moderate watering. If you’re looking for a statement plant that’s both beautiful and fuss-free, the Peace Lily is the one to bring home.</p>",
    "tags": [
      "air-purifying",
      "b2g1",
      "Birthday",
      "Birthday_plants",
      "buy3",
      "featured",
      "flowering-plants",
      "low-light",
      "Peace Lily Plant",
      "Plants",
      "price-drop",
      "retail-store",
      "top-200-sku",
      "Vastu-friendly"
    ],
    "variants": [
      {
        "id": "51066887340164",
        "title": "Default Title",
        "price": 1449,
        "compareAtPrice": 1999,
        "available": true,
        "sku": "NUPL0832"
      }
    ]
  },
  {
    "id": "6940907307140",
    "handle": "yellow-capsicum-50-seeds",
    "title": "Yellow Capsicum Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 144,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w4zynT57EI-Recovered.jpg?v=1790250986",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w4zynT57EI-Recovered.jpg?v=1790250986",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_12_fc29a856-25cd-43ae-8bbf-925631b842c2.jpg?v=1792757396",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_28.jpg?v=1792757417",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_29.jpg?v=1792757429",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_12_199a9d01-f4fa-4d30-9ee6-7f1f16bbc54e.jpg?v=1792757442",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_30.jpg?v=1792757456",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_35.jpg?v=1792757475"
    ],
    "descriptionHtml": "Yellow capsicum, also known as yellow bell pepper or sweet pepper (Capsicum annual), is becoming popular in urban India. It can be stuffed and cooked or sliced in salads. Yellow capsicum plants require more care and attention than most other vegetable crops to get proper yield. The plant needs daily 6 to 8 hours of direct sunlight when grown in winter.",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "top-200-sku",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859122270340",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO371"
      }
    ]
  },
  {
    "id": "6940994371716",
    "handle": "green-cucumber-seeds-long",
    "title": "Green Cucumber Seeds (Long)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 225,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_18.jpg?v=1792267197",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_18.jpg?v=1792267197",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_15_28d2de54-a71e-4d0a-8714-6639293f6b77.jpg?v=1792267182",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_17_558d34d9-a7ed-4ffa-a4cc-02f438e7b8e8.jpg?v=1792267171",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_18.jpg?v=1792267155",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_18.jpg?v=1792267138",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_16.jpg?v=1792267125",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_15_f3bff7cf-221e-4dc3-9fc0-e99bb95e2623.jpg?v=1792742128"
    ],
    "descriptionHtml": "<p>Green Cucumber is a cooling, fast-growing vine vegetable. It's a summer favourite in Indian home gardens. Refreshing, easy to grow, and quick to yield.</p><ul>\n<li>Rich in water content, vitamin K, and antioxidants</li>\n<li>One of the best ways to stay cool and hydrated through summer</li>\n<li>Toss it into salads, raita, sandwiches, or slice it fresh as a snack</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free cucumbers all season long</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 42</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41257004138628",
        "title": "1.2 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO161"
      },
      {
        "id": "41257004171396",
        "title": "25 gm",
        "price": 300,
        "compareAtPrice": 300,
        "available": false,
        "sku": "NUVSO162"
      }
    ]
  },
  {
    "id": "6940809298052",
    "handle": "red-round-radish-seeds",
    "title": "Red Round Radish Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 57,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_6ATxqJpiJO.jpg?v=1788868780",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_6ATxqJpiJO.jpg?v=1788868780",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_2-02_5.jpg?v=1788868318",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_16_0986598b-3cc0-4418-808b-e81ea582dc5f.jpg?v=1792756400",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_17_cc24c3d4-8753-480d-b14a-8c64b1b2103e.jpg?v=1792756408",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_0007dfb4-03a0-4968-bd2d-d25fff80d399.jpg?v=1788868336",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_18_cf51b08a-a620-42f7-b3a3-9a5dca890198.jpg?v=1792756423",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-07_5.jpg?v=1788868303"
    ],
    "descriptionHtml": "<p>Red Round Radish is the fastest vegetable you can grow at home. Bright, crisp, and mildly peppery, it goes from seed to table in under a month and looks wonderful on any plate.</p><ul>\n<li>Ready in 20–30 days; one of the fastest crops for home gardens.</li>\n<li>Bright red, round, crisp roots with a mild peppery flavour.</li>\n<li>Rich in vitamin C, folate, and fibre.</li>\n<li>Both the root and the leaves are edible and great in salads and raita.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 90</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40858913472644",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO296"
      }
    ]
  },
  {
    "id": "6940811001988",
    "handle": "desi-carrot-seeds-long",
    "title": "Desi Carrot Seeds (Long)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 217,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_xS4hdpajfW.jpg?v=1788877017",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_xS4hdpajfW.jpg?v=1788877017",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_9188b23d-6945-4e7a-8b71-325d4fcf63c7.jpg?v=1788876892",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_4_6af99672-0475-471c-8361-f814412204ba.jpg?v=1792742013",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_5.jpg?v=1792741995",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_20ce2d4d-9b1e-4597-a346-bfcd05b2dc8e.jpg?v=1788877111",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_6_27a33b8e-c7e6-42c5-ae1f-d350e99ea826.jpg?v=1792741977",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_328ee7bf-becf-4e06-89d2-0f76540118c3.jpg?v=1788876873"
    ],
    "descriptionHtml": "<p>Desi Carrot is a classic Indian long variety with a sweet, rich flavour that beats any supermarket carrot. Grown fresh from seed in your own home garden, it is a winter reward worth waiting for.</p><ul>\n<li>Long, sweet, deep orange roots rich in beta-carotene, vitamin A, and fibre.</li>\n<li>Freshly harvested desi gajar at home tastes nothing like store-bought.</li>\n<li>Great in gajar halwa, sabzi, salads, fresh juice, and soups.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free gajar all winter long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 400</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40858918518916",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO121"
      }
    ]
  },
  {
    "id": "6940998631556",
    "handle": "beetroot-seeds",
    "title": "Beetroot Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 99,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_8_8c400174-6d6c-46f0-b6d0-51859b237fb2.jpg?v=1792266462",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_8_8c400174-6d6c-46f0-b6d0-51859b237fb2.jpg?v=1792266462",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_5_b823d2ef-5374-4bbb-96f8-ffaf93c1799a.jpg?v=1792266447",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_7_99aa4ca5-58a9-4d30-bd23-6ab538e98aa8.jpg?v=1792266436",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_8_cd3a85e8-7aea-43d7-9204-aa9fd6cb3b6f.jpg?v=1792266417",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_8.jpg?v=1792266403",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_6.jpg?v=1792266389",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_3e44cd6c-b14f-43b9-a2a6-5302d5709255.jpg?v=1792734555"
    ],
    "descriptionHtml": "<p>Beetroot (Chukander) is a satisfying, nutritious root vegetable that grows well in Indian home gardens from August through winter. Earthy, sweet, and versatile in the kitchen.</p><ul>\n<li>Rich in folate, iron, potassium, and natural nitrates that support energy and health.</li>\n<li>Both the deep red root and the green leaves are edible and nutritious.</li>\n<li>Great in salads, fresh juice, curries, soups, and roasted dishes.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free chukandar all season long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 53</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "Sprout",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41256998633604",
        "title": "2 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO026"
      },
      {
        "id": "41256998666372",
        "title": "25 gm",
        "price": 300,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUVSO027"
      },
      {
        "id": "41320242512004",
        "title": "100 gm",
        "price": 570,
        "compareAtPrice": 570,
        "available": true,
        "sku": "NUVSO028"
      },
      {
        "id": "41361861640324",
        "title": "250 gm",
        "price": 1290,
        "compareAtPrice": 1290,
        "available": false,
        "sku": "NUVSO029"
      }
    ]
  },
  {
    "id": "6940808216708",
    "handle": "red-cabbage-seeds",
    "title": "Red Cabbage Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 224,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_YM8Jg1AWeC.jpg?v=1788876342",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_YM8Jg1AWeC.jpg?v=1788876342",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_6dcc0243-8243-43f2-af6d-972e227373c6.jpg?v=1788877015",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_12_6e70a98a-8fa1-442b-ac7d-17c7fb48f241.jpg?v=1792756219",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_13_4c184a44-2127-4eeb-87af-4efba7d23223.jpg?v=1792756229",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_9a201269-d98e-42ce-95a4-08ac617a9c24.jpg?v=1788876391",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_14_f296eee7-23b5-4fa8-bef7-b6bc36bd79f0.jpg?v=1792756244",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_bf223481-041f-42ea-aacf-fc0fc4858a27.jpg?v=1788877133"
    ],
    "descriptionHtml": "<p>Red Cabbage (Laal Patta Gobhi) is more nutritious than green cabbage and far more visually striking. Its deep purple-red heads bring colour and nutrition to your winter garden and kitchen.</p><ul>\n<li>Dense, vibrant purple-red heads richer in antioxidants than green cabbage.</li>\n<li>Rich in vitamin C, vitamin K, and anthocyanins that support immunity and heart health.</li>\n<li>Delicious raw, pickled, stir-fried, or braised; great in coleslaw, salads, and wraps.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free laal patta gobhi all winter long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 210</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40858911834244",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO101"
      }
    ]
  },
  {
    "id": "6940996337796",
    "handle": "red-amaranthus-seeds-red-math",
    "title": "Red Amaranthus Seeds (Red Math)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 67,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_23.jpg?v=1792266779",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_23.jpg?v=1792266779",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_20.jpg?v=1792266762",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_22.jpg?v=1792266752",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_23_eeb86851-61a5-4e46-9a25-04441bce0ec7.jpg?v=1792266735",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_23.jpg?v=1792266717",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_21.jpg?v=1792266703",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_21_f5998c98-f22a-4f3d-ac45-a31af12407fc.jpg?v=1792756197"
    ],
    "descriptionHtml": "<p>Red Amaranthus is a vibrant, fast-growing leafy green. A nutritious staple in Indian home gardens. Easy to grow and ready to harvest in weeks.</p><ul>\n<li>Rich in iron, calcium, vitamin A, and protein</li>\n<li>One of the easiest ways to add colour and nutrition to your daily meals</li>\n<li>Toss it into sabzi, dal, soups, or stir-fry it with garlic</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free amaranthus all season long</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 800</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "Sprout",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859345682564",
        "title": "5 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO011"
      },
      {
        "id": "40859345715332",
        "title": "100 gm",
        "price": 300,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUVSO013"
      },
      {
        "id": "40859345748100",
        "title": "250 gm",
        "price": 555,
        "compareAtPrice": 555,
        "available": true,
        "sku": "NUVSO014"
      }
    ]
  },
  {
    "id": "6940810707076",
    "handle": "zucchini-seeds-squash",
    "title": "Zucchini Seeds (Squash)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 164,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_27.jpg?v=1792268160",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_27.jpg?v=1792268160",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_24.jpg?v=1792268145",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_26.jpg?v=1792268134",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_27.jpg?v=1792268120",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_27.jpg?v=1792268094",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_25.jpg?v=1792268082",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_25.jpg?v=1792756529"
    ],
    "descriptionHtml": "<p>Zucchini is one of the most productive and fastest fruiting vegetables you can grow at home. Give it full sun and water and it will reward you generously.</p><ul>\n<li>Fast fruiting; fresh zucchini in under 2 months.</li>\n<li>Rich in vitamin C, vitamin A, potassium, and fibre.</li>\n<li>Versatile in the kitchen; great in sabzi, pasta, soups, and stir-fries.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free zucchini all season long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 6</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40858916978820",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO361"
      }
    ]
  },
  {
    "id": "6940992602244",
    "handle": "cauliflower-seeds",
    "title": "Cauliflower Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 285,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_10_5aa2b504-6419-4cee-9922-021a3d50d8c9.jpg?v=1792267302",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_10_5aa2b504-6419-4cee-9922-021a3d50d8c9.jpg?v=1792267302",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_7_45222913-f3e9-47c6-bdc7-e95cf8c20f0d.jpg?v=1792267288",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_9_9fa40faf-d80b-44b8-ad6a-c93f61932b2c.jpg?v=1792267277",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_10.jpg?v=1792267260",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_10.jpg?v=1792267244",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_8.jpg?v=1792267232",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_7_f970e19e-d44d-4a4c-9a61-691d16f6a90f.jpg?v=1792741756"
    ],
    "descriptionHtml": "<p>Cauliflower is one of the most satisfying vegetables to grow at home; a patient, rewarding process that ends with a beautiful, firm head right from your own garden.</p><ul>\n<li>Dense, creamy white curds rich in vitamin C, vitamin K, and fibre.</li>\n<li>A cool-season crop that thrives in Indian winters when temperatures drop.</li>\n<li>Perfect in aloo gobhi, soups, stir-fries, and rice dishes.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free gobhi all winter long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 275</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41257009086596",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO131"
      },
      {
        "id": "41257009119364",
        "title": "25 gm",
        "price": 420,
        "compareAtPrice": 420,
        "available": false,
        "sku": "NUVSO132"
      }
    ]
  },
  {
    "id": "6940807266436",
    "handle": "green-onion-seeds-leek",
    "title": "Green Onion Seeds (Leek)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 219,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_19.jpg?v=1792268264",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_19.jpg?v=1792268264",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_16_90d4f639-1555-4c85-b17e-e1c6f350665a.jpg?v=1792268246",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_18_a036921c-acbf-40be-86c9-30498cdc7171.jpg?v=1792268235",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_19.jpg?v=1792268216",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_19.jpg?v=1792268202",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_17_5ec68097-3f43-4856-8498-6676395298f3.jpg?v=1792268189",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_16_8365bfe1-fb99-497d-a26a-83db51960ddd.jpg?v=1792742156"
    ],
    "descriptionHtml": "<p>Green Onions or Spring Onions are a kitchen garden essential; quick to grow, endlessly useful, and freshest when cut right from your own pot.</p><ul>\n<li>Fresh green tops with a mild, crisp onion flavour for everyday use.</li>\n<li>Rich in vitamin C, vitamin K, and folate.</li>\n<li>Both green leaves and white bulb are edible; nothing goes to waste.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, fresh spring onions whenever you need them.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 125</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40858909343876",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO261"
      }
    ]
  },
  {
    "id": "6940993781892",
    "handle": "bottlegourd-seeds-long",
    "title": "Bottlegourd Seeds (Long)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 249,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1.jpg?v=1792734704",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1.jpg?v=1792734704",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_1_31926d8b-fd89-4fa4-9d48-3e733e19a406.jpg?v=1792734659",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_1_500e527a-550f-4720-ae84-f78bb732d777.jpg?v=1792734753",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_1_0380f374-cdf7-4bd1-a3c9-f738851620ad.jpg?v=1792734734",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_1_c2b98a7f-9b5c-4eb7-8b13-b26c243d27b4.jpg?v=1792734689",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_1_3f42318a-e6da-472a-9fbc-c7258b1c73a0.jpg?v=1792734716",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_2_4e92e7fd-049c-4d41-b332-748e15fdcb26.jpg?v=1792734674"
    ],
    "descriptionHtml": "<p>Bottlegourd is a vigorous, fast-growing vine vegetable. It's a light, cooling favourite in Indian kitchens. Easy to grow once it has room to climb.</p><ul>\n<li>Rich in fiber, vitamin C, and water content</li>\n<li>One of the best ways to add a light, easy-to-digest vegetable to your meals</li>\n<li>Toss it into sabzi, dal, kofta, or a simple lauki curry</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free lauki all season long</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 6</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859340112004",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO041"
      }
    ]
  },
  {
    "id": "6940989128836",
    "handle": "radish-golden-seeds-pusa-chatki",
    "title": "Radish Golden Seeds (Pusa Chatki)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 191,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_Dof67MSpcl.jpg?v=1788869289",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_Dof67MSpcl.jpg?v=1788869289",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_9a84e2b5-796b-4f7d-8b44-4e77e72489d0.jpg?v=1788869143",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_11_d3912820-881d-492a-8f9f-9ef1d23f709a.jpg?v=1792756186",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_12_203cc766-7068-46f2-ac3a-570a9e6a2c18.jpg?v=1792756170",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_9095fe8a-3bd7-4936-9ef2-a5b2e629236a.jpg?v=1788869304",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_13_64e7df58-c5cc-4804-aa3a-299a6bbd5089.jpg?v=1792756157",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_a6248ca4-861a-45d8-9c62-1e126b0a4bc0.jpg?v=1788869116"
    ],
    "descriptionHtml": "<p>Pusa Chatki Radish is one of the fastest vegetables you can grow at home, ready in under 5 weeks. Crisp, mild, and rewarding to pull from the soil right from your own pot.</p><ul>\n<li>One of the quickest vegetables to grow and harvest at home.</li>\n<li>Crisp, mild, and refreshing; great in salads, raita, sabzi, and fresh.</li>\n<li>Rich in vitamin C, folate, and fibre.</li>\n<li>Both the root and the leaves (mooli ke patte) are edible and delicious.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 92</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "Sprout",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41320251523204",
        "title": "3 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO281"
      },
      {
        "id": "41320251555972",
        "title": "100 gm",
        "price": 270,
        "compareAtPrice": 270,
        "available": true,
        "sku": "NUVSO283"
      }
    ]
  },
  {
    "id": "6940907077764",
    "handle": "cherry-tomatoes-seeds-yellow",
    "title": "Cherry Tomatoes Seeds (Yellow)",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 109,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_11_f3d84057-1f54-4d91-b0f7-5bee2d2e68c3.jpg?v=1792267950",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_11_f3d84057-1f54-4d91-b0f7-5bee2d2e68c3.jpg?v=1792267950",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_8_d8ec8d41-cc3e-4713-8ee1-87181f787d95.jpg?v=1792267934",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_10_363afa32-dacc-4c49-9f9a-58517183f900.jpg?v=1792267920",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_11_5e6db56b-fbe1-4406-be2b-cca125b9778c.jpg?v=1792267905",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_11.jpg?v=1792267888",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_9.jpg?v=1792267877",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_9_e96c28fb-5df1-427d-9243-c02d4fcdb9ae.jpg?v=1792741887"
    ],
    "descriptionHtml": "<p>Yellow Cherry Tomatoes are sweeter and milder than their red cousins and absolutely beautiful on the vine. One plant can keep you in fresh tomatoes for months with very little effort.</p><ul>\n<li>Sweet, mild yellow cherry tomatoes with lower acidity; great for snacking straight off the vine.</li>\n<li>Rich in vitamin C, vitamin A, and lycopene.</li>\n<li>Prolific fruiter; one healthy plant can produce hundreds of fruits.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free cherry tomatoes all season long.</li>\n</ul>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859122237572",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO366"
      }
    ]
  },
  {
    "id": "6940804677764",
    "handle": "brinjal-banarshi-giant-seeds",
    "title": "Brinjal Banarasi Giant Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 99,
    "compareAtPrice": 145,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 91,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_9_dd00cb1c-1c65-490c-9ee9-a2b1ade5fcfc.jpg?v=1792268475",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_9_dd00cb1c-1c65-490c-9ee9-a2b1ade5fcfc.jpg?v=1792268475",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_6_05f447e4-a0d5-467e-ac4b-031f336d3173.jpg?v=1792268457",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_8_cb8481d1-a51d-4541-9bba-ce99632ba745.jpg?v=1792268445",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_9.jpg?v=1792268429",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_9.jpg?v=1792268414",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_7.jpg?v=1792268395",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_3_e26db3f6-b174-4151-9088-558327f5f1ac.jpg?v=1792734761"
    ],
    "descriptionHtml": "<p>Brinjal Banarasi Giant is a classic Indian vegetable known for its large, meaty fruits and rich flavour; a must-have in any home kitchen garden.</p><ul>\n<li>Large, deep purple, firm fruits perfect for baingan bharta, curries, and stir-fries.</li>\n<li>Rich in fibre, vitamin B6, and antioxidants.</li>\n<li>Grows well in large pots, grow bags, and garden beds.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free brinjal all season long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 220</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "41257007186052",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 145,
        "available": true,
        "sku": "NUVSO066"
      },
      {
        "id": "41257007218820",
        "title": "25 gm",
        "price": 300,
        "compareAtPrice": 300,
        "available": true,
        "sku": "NUVSO067"
      }
    ]
  },
  {
    "id": "6941048766596",
    "handle": "pak-choi-seeds",
    "title": "Pak Choi Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 184,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_mEKY3WchJQ.jpg?v=1788875770",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_mEKY3WchJQ.jpg?v=1788875770",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_c1deddb3-d943-45dc-9a49-830d450db08e.jpg?v=1788875908",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_9.jpg?v=1792749120",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_10_c78d5f6a-3ecd-4868-a046-a9bc2c99567b.jpg?v=1792749136",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_e47960d5-c6c2-4dcb-873d-1236b1b4c38e.jpg?v=1788876087",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_11_3d12c1ce-e5dd-4a5f-9db8-3843ede465a1.jpg?v=1792749148",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_e156a231-3437-4e8a-b92e-948a7d027f33.jpg?v=1788875937"
    ],
    "descriptionHtml": "<p>Pak Choi is one of the quickest and most rewarding vegetables to grow in Indian home gardens through the cooler months. Mild, crisp, and nutritious, ready in under 10 weeks and extremely versatile in Asian and Indian cooking.</p><ul>\n<li>Rich in vitamin C, vitamin K, calcium, and antioxidants.</li>\n<li>Mild, crisp leaves and juicy stems great in stir-fries, soups, and noodle dishes.</li>\n<li>Quick growing and compact; perfect for pots, balconies, and small spaces.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, fresh pak choi all season long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 220</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859440087172",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO401"
      }
    ]
  },
  {
    "id": "6940908388484",
    "handle": "kale-250-seeds",
    "title": "Kale Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 199,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_gO3EtGiSXO.jpg?v=1788869009",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_gO3EtGiSXO.jpg?v=1788869009",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_2d56dfeb-1c27-40bb-9a3d-bce5c2126bbc.jpg?v=1788868708",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_6.jpg?v=1792742279",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_7.jpg?v=1792742265",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_d65b54e2-9eee-4ebf-82aa-66842f3119f2.jpg?v=1788869010",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_8_ac8d2b54-9f27-483e-bc84-dfbf0b8e2146.jpg?v=1792742296",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_a143aca0-4ee7-489d-a266-23d068332e9f.jpg?v=1788869624"
    ],
    "descriptionHtml": "<p>Kale is the king of nutritious greens and one of the most satisfying vegetables to grow in an Indian home garden. Robust, long-producing, and incredibly versatile in the kitchen. It has two sowing windows in India.</p><ul>\n<li>One of the most nutrient-dense vegetables you can grow; rich in vitamin K, vitamin C, calcium, and iron.</li>\n<li>Keeps producing leaves for months from a single sowing.</li>\n<li>Use in smoothies, salads, soups, stir-fries, or baked into crispy kale chips.</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free kale all season long.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 460</p>",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859124629636",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO381"
      }
    ]
  },
  {
    "id": "6941048504452",
    "handle": "lettuce-black-rose-seeds",
    "title": "Lettuce Black Rose Seeds",
    "category": "seeds",
    "subCategory": "vegetable-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 278,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_SyAJAXtUb8-Recovered.jpg?v=1790250903",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_SyAJAXtUb8-Recovered.jpg?v=1790250903",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_7.jpg?v=1792756947",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_23_0ed128cf-2b4a-4496-9c8e-b7e80f67e34a.jpg?v=1792756998",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_24_6bb69813-7cdf-459c-a4ec-0c2b8bf771d2.jpg?v=1792756977",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_7_fd858fd0-cd82-4593-86ee-23001ba5e615.jpg?v=1792756962",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_25_99f505a8-c574-46ba-ba78-1d1d04bfe89c.jpg?v=1792757023",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_30.jpg?v=1792757008"
    ],
    "descriptionHtml": "Who says Italian is all about pastas? Their salads are both healthy and lip-smacking. The black rose lettuce is a relatively unknown variety, but just as amazing as any. It has curly, fan-shaped leaves in deep red and a shiny surface. The leaves form a compact rosette when they grow 5- to 8-inches. This lettuce has a slightly bitter and nutty flavour, making it the perfect balance for sweeter lettuces or dressings.",
    "tags": [
      "Aroma",
      "Harvest",
      "retail-store",
      "veg-seeds"
    ],
    "variants": [
      {
        "id": "40859439726724",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUVSO396"
      }
    ]
  },
  {
    "id": "6941002301572",
    "handle": "vinca-seeds",
    "title": "Vinca Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 135,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w4ZLnGm7EI.jpg?v=1788609899",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w4ZLnGm7EI.jpg?v=1788609899",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_6f70601d-32a0-4490-b884-c980757c6fec.jpg?v=1788609901",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_87fe5c4d-307c-4bb8-9d65-7e8b247be2fc.jpg?v=1788609916",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_68d1b0ad-c2a4-488e-9b64-8e30dddbd14f.jpg?v=1788609929",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_7ef5b027-7f04-4e4f-acf9-a73b4347b731.jpg?v=1788609946",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_cf3fbb00-3341-4544-9e59-46a594fc5bc8.jpg?v=1788609958"
    ],
    "descriptionHtml": "<p>Vinca, or Periwinkle, is one of the toughest and most cheerful flowering plants for Indian gardens. It blooms in full sun, handles heat like a champion, and asks for very little in return.</p><ul>\n<li>Vibrant 5-petalled blooms in shades of pink, red, white, lavender, and white.</li>\n<li>One of the most heat and drought tolerant flowers for Indian conditions.</li>\n<li>Flowers continuously through the warm months with minimal care.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long.</li>\n</ul><p>Number of seeds per gram (aprox): 520</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859364393092",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO089"
      }
    ]
  },
  {
    "id": "8218544111748",
    "handle": "lotus-seeds",
    "title": "Lotus Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 199,
    "compareAtPrice": 399,
    "discountPercent": 50,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 122,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_vQ1xPkoa47.jpg?v=1788616567",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_vQ1xPkoa47.jpg?v=1788616567",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_72f3f636-dca5-4c06-8fee-c464e978a5b3.jpg?v=1788616578",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_9e010032-25d2-4581-a4bf-1ed4c77c55f0.jpg?v=1788616594",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_26f60f02-c248-4b62-b81e-6ca49f3b1811.jpg?v=1788616612",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_42d81319-f403-4767-8f36-c0b75aa0a30e.jpg?v=1788616634",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_b7961de2-5dee-49b3-b068-7f47a255f23e.jpg?v=1788616648"
    ],
    "descriptionHtml": "<p>Lotus is a stunning aquatic flowering plant. It's deeply symbolic in Indian culture and grows beautifully in water. A rewarding choice for ponds, tubs, and water gardens.</p><ul>\n<li>Produces large, elegant blooms in pink, white, and red</li>\n<li>Sacred in Indian tradition, often used in puja and festive décor</li>\n<li>Great for garden ponds, large tubs, and water features</li>\n<li>Grow it organically using Ugaoo's Potting Mix as the base substrate, chemical-free blooms all season long</li>\n</ul>",
    "tags": [
      "Aroma",
      "featured",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "44773440880772",
        "title": "Default Title",
        "price": 199,
        "compareAtPrice": 399,
        "available": true,
        "sku": "NUFSO127"
      }
    ]
  },
  {
    "id": "6941068656772",
    "handle": "antirrhinum-seeds",
    "title": "Antirrhinum Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 166,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_ks4j4mg16B-Recovered.jpg?v=1790250929",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_ks4j4mg16B-Recovered.jpg?v=1790250929",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/antirrhinum-seeds-31901939171460.jpg?v=1756471974"
    ],
    "descriptionHtml": "<p dir=\"ltr\"><span>Also known as Snapdragons, Antirrhinums are flowering plants that boast stunning blooms during the spring and fall months. These plants - undoubtedly - bring mesmerizing aesthetics to gardens but they are also known to be so much more than just pretty faces. The leaves and flowers of these plants have also been popularly used in traditional medicine for years, making them multifunctional all-rounders! </span><span>Antirrhinum flower seeds </span><span>are easily grown and with the right care, they will germinate within 10-21 days. Moreover, within 2.5-4 months of sowing the seeds, they will reward you with their gorgeous, long-lasting blooms!</span></p>\n<p> </p><p>Number of seeds per gram (aprox): 8562</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859478163588",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO007"
      }
    ]
  },
  {
    "id": "6940980215940",
    "handle": "dianthus-mix-seeds",
    "title": "Dianthus Mix Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 162,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_yinW8iUPW9.jpg?v=1788616379",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_yinW8iUPW9.jpg?v=1788616379",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_6592b26f-682a-4348-bb92-18dc9b128c6a.jpg?v=1788616383",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_e033f92e-7e72-4498-96de-070ab31700e2.jpg?v=1788616394",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_b004d5e8-0069-4b3c-8ed4-fbbb014ea4fc.jpg?v=1788616412",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_addcb5cd-8d3a-4099-93f1-795b1249f130.jpg?v=1788616430",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_9bf691b1-c7a0-499c-ada4-fe6447ca9e16.jpg?v=1788616455"
    ],
    "descriptionHtml": "<p>Dianthus brings the look of carnations to Indian home gardens through the cool months. Fringed, scented blooms that add colour and charm from winter into early spring.</p><ul>\n<li>Fringed, fragrant flowers in shades of pink, red, white, and bicoloured mixes.</li>\n<li>A sweet clove-like fragrance that fills patios, balconies, and window areas.</li>\n<li>Long flowering season through Indian winter; great for festive and everyday décor.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all winter long.</li>\n</ul><p>Number of seeds per gram (aprox): 886</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41278626726020",
        "title": "0.5 GM",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO037"
      },
      {
        "id": "41278626758788",
        "title": "25 GM",
        "price": 1350,
        "compareAtPrice": 1350,
        "available": true,
        "sku": "NUFSO038"
      }
    ]
  },
  {
    "id": "6940636053636",
    "handle": "flower-seeds-bundle-of-5-packet",
    "title": "Flower Seeds Bundle of 5 Packet",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 449,
    "compareAtPrice": 775,
    "discountPercent": 42,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 75,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/bundle_seeds.png?v=1785851898",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/bundle_seeds.png?v=1785851898"
    ],
    "descriptionHtml": "<p>Turn your home into a garden paradise with our flowers combo seeds pack.</p>\n<ul>\n<li> These easy-to-grow flowers come in different sizes and shapes and have been assorted to give you the feeling of living in a field of flowers. The seeds are extremely easy to grow and care for.</li>\n</ul>",
    "tags": [
      "Aroma",
      "flower-seed",
      "top-200-sku"
    ],
    "variants": [
      {
        "id": "40858549289092",
        "title": "Default Title",
        "price": 449,
        "compareAtPrice": 775,
        "available": true,
        "sku": "NUFSOC04"
      }
    ]
  },
  {
    "id": "6940916252804",
    "handle": "salvia-blue-seeds",
    "title": "Salvia Blue Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 143,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_yinW8ciPW9.jpg?v=1788616677",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_yinW8ciPW9.jpg?v=1788616677",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_e18b6273-df03-4ec4-9523-2084cda5619e.jpg?v=1788616681",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_049b7db5-f478-48fc-acbf-254ef939b53e.jpg?v=1788616696",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_87de9265-a8c6-452c-8111-bf59dbf20922.jpg?v=1788616708",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_0c3454b2-5861-49c4-9cb7-e25c3f199278.jpg?v=1788616722",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_cd9025ee-34ca-4f24-9e48-a96256a0e54e.jpg?v=1788616736"
    ],
    "descriptionHtml": "<p>Salvia Blue is a tall, striking flower with vivid blue-purple spikes that draw butterflies and bees and add vertical drama to any garden space. Heat-loving and long-flowering.</p><ul>\n<li>Tall blue-purple flower spikes that add vivid colour and vertical interest.</li>\n<li>A magnet for butterflies and bees; great for pollinator-friendly gardens.</li>\n<li>Long flowering season through the warm months with very little care.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long.</li>\n</ul><p>Number of seeds per gram (aprox): 307</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859143110788",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO0119"
      }
    ]
  },
  {
    "id": "6940816670852",
    "handle": "mesembryanthemum-mix-seeds",
    "title": "Mesembryanthemum Mix Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 167,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_vQ1cAiia47.jpg?v=1788876644",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_vQ1cAiia47.jpg?v=1788876644",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_2_1adc9272-5383-495d-a44c-9baf6f9b890e.jpg?v=1788876536",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_1949b130-4064-4bbd-a26d-008a880b3973.jpg?v=1788876561",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_88c48d7e-1723-4d4a-8aa9-64113d181ef8.jpg?v=1788875866",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_e6e65412-b1b7-42ec-a2df-9f4344795979.jpg?v=1788875924",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_a7359560-0049-44de-b7cf-05924882088c.jpg?v=1788876766"
    ],
    "descriptionHtml": "<p>Mesembryanthemum, or Ice Plant, produces some of the most vivid jewel-bright daisy flowers in the winter garden. They literally sparkle in sunlight and close like clocks at night.</p><ul>\n<li>Vivid daisy-like flowers in pink, red, orange, yellow, and white with a glittering texture.</li>\n<li>Flowers that open in bright sun and close at night; one of nature's most charming tricks.</li>\n<li>Extremely drought tolerant; perfect for sunny, dry spots and containers.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, dazzling blooms all winter long.</li>\n</ul><p>Number of seeds per gram (aprox): 4470</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41257048866948",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO0107"
      },
      {
        "id": "41257048899716",
        "title": "25 gm",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": true,
        "sku": "NUFSO0123"
      }
    ]
  },
  {
    "id": "6940799828100",
    "handle": "alyssum-200-seeds",
    "title": "Alyssum Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 246,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_s76fIrkl8e.jpg?v=1788875637",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_s76fIrkl8e.jpg?v=1788875637",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_2_a2acc839-1978-4c65-b4f7-cbaa9fd762f0.jpg?v=1788876275",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_400de35e-bf25-44ee-9f5c-e75e956c13c7.jpg?v=1788876139",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_cc505b7c-c404-4211-829a-e216f3dbefb5.jpg?v=1788875638",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_cbd05074-631a-4ca0-b5c2-4e0ba7347eec.jpg?v=1788876210",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_cd4c4273-b739-42d4-8984-652e8dab7b04.jpg?v=1788876050"
    ],
    "descriptionHtml": "<p>Alyssum is the sweetest-scented ground cover for winter gardens. A carpet of tiny honey-fragranced flowers that attract beneficial insects and make every border look finished and beautiful.</p><ul>\n<li>Tiny, honey-scented white and pink blooms that create a beautiful low flowering carpet.</li>\n<li>One of the fastest-flowering winter plants; blooms in as little as 6 weeks.</li>\n<li>A natural beneficial insect attractor; excellent companion plant for vegetable gardens.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, fragrant blooms all winter long.</li>\n</ul><p>Number of seeds per gram (aprox): 2950</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40858894008452",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO005"
      }
    ]
  },
  {
    "id": "6941003382916",
    "handle": "nasturtium-mix-seeds",
    "title": "Nasturtium Mix Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 146,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_gO3EmOlSXO.jpg?v=1788869488",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_gO3EmOlSXO.jpg?v=1788869488",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_2_da55fa73-19f8-460c-b82c-4ba41e4f3b62.jpg?v=1788868891",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_783c723d-e2a9-412b-a4df-c337bef0df1c.jpg?v=1788869399",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_139377ce-35b8-44c6-b166-007790f0e8ef.jpg?v=1788869450",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_ebebd009-51f7-413e-8b38-3d14c58090c5.jpg?v=1788868832",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_abb4242d-4603-44d9-8691-56c71fbf5c54.jpg?v=1788868845"
    ],
    "descriptionHtml": "<p>Nasturtium is the most edible flower in your garden. Bold, cheerful blooms with a peppery kick - both the flowers and leaves go straight from garden to plate. Fast, easy, and loved by beginners.</p><ul>\n<li>Both flowers and leaves are edible; peppery and watercress-like in flavour.</li>\n<li>Quick-blooming in 40–60 days; one of the fastest flowering plants for Indian gardens.</li>\n<li>Flowers in warm shades of orange, yellow, red, and cream.</li>\n<li>A natural pest trap that draws aphids away from your vegetables.</li>\n</ul><p>Number of seeds per gram (aprox): 8</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859369078916",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO061"
      }
    ]
  },
  {
    "id": "6940981788804",
    "handle": "zinnia-lilliput-mix-seeds",
    "title": "Zinnia Lilliput Mix Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 293,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_s7N7taSl8e.jpg?v=1788609300",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_s7N7taSl8e.jpg?v=1788609300",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4.jpg?v=1788609319",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4.jpg?v=1788609337",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4.jpg?v=1788609353",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1.jpg?v=1788609373",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1.jpg?v=1788609387"
    ],
    "descriptionHtml": "<p>Zinnia Lilliput Mix is a compact, free-flowering annual. It brings vibrant, non-stop colour to Indian home gardens. One of the easiest flowering plants for beginners.</p><ul>\n<li>Produces small, pom-pom-like double blooms in pink, red, orange, yellow, and white</li>\n<li>One of the fastest-flowering annuals. Perfect for quick garden colour or festive décor</li>\n<li>Great for borders, pots, balconies, and cut flower bouquets</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 162</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859300823172",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO093"
      }
    ]
  },
  {
    "id": "6941004529796",
    "handle": "sunflower-sungold-seeds",
    "title": "Sunflower Sungold Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 118,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_eIC0HBEdqL.jpg?v=1788609714",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_eIC0HBEdqL.jpg?v=1788609714",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_f2af26ad-f762-4d45-a50b-bd61f1f69691.jpg?v=1788609719",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_99f3a541-c80e-4b6b-8339-b75d8a691ebd.jpg?v=1788609737",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_4feb41d9-e13d-46d2-9bc2-d0681d061a90.jpg?v=1788609752",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_89864c73-f397-43cd-b0b8-47a4dbe823b6.jpg?v=1788609763",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_b5d39467-5af6-4657-a54c-3f4014d9b144.jpg?v=1788609777"
    ],
    "descriptionHtml": "<p>Sunflower Sungold is a cheerful, fully double variety. It's known for its fluffy, golden-yellow blooms. A bright, feel-good addition to any Indian garden.</p><ul>\n<li>Produces dense, double blooms in vibrant golden-yellow shades</li>\n<li>A fast, rewarding flower that adds instant cheer to balconies and gardens</li>\n<li>Great for pots, gardens borders, garden beds, and cut flower arrangements</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859370848388",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO079"
      }
    ]
  },
  {
    "id": "6940979167364",
    "handle": "lupins-seeds",
    "title": "Lupins Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 65,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_SyAJAAWUb8-Recovered.jpg?v=1790250946",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_SyAJAAWUb8-Recovered.jpg?v=1790250946",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/lupins-seeds-31902262263940.jpg?v=1756471222"
    ],
    "descriptionHtml": "<p>Lupins are among the most dramatic and beautiful cool-season flowers you can grow in India. Tall, vivid spikes in a stunning range of colours that transform any winter garden.</p><ul>\n<li>Tall, striking flower spikes in purple, pink, red, yellow, white, and bicoloured varieties.</li>\n<li>A cool-season beauty that thrives through Indian winters with minimal care.</li>\n<li>Nitrogen-fixing roots naturally improve soil health.</li>\n<li>Grow it organically with Ugaoo's Potting Mix, stunning blooms all winter long.</li>\n</ul><p>Number of seeds per gram (aprox): 48</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859283292292",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO055"
      }
    ]
  },
  {
    "id": "6940982739076",
    "handle": "ipomoea-morning-glory-seeds",
    "title": "Ipomoea Morning Glory Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 185,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_P3nUThL42C.jpg?v=1788609989",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_P3nUThL42C.jpg?v=1788609989",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_6c442e91-4ea1-40c6-90e1-e0ea824c4cf6.jpg?v=1788609990",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_d073e795-defa-476b-8247-db4105c5a362.jpg?v=1788610002",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_e518e948-b7a6-4bf3-a7c0-05bb773f2eb7.jpg?v=1788610015",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_44692208-6d7c-4f9e-abb5-c116bc6c194b.jpg?v=1788610033",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_7720cdad-4927-4ae7-8fa5-f34bd5ff7c8f.jpg?v=1788610049"
    ],
    "descriptionHtml": "<p>Morning Glory is a fast, vigorous climbing flower that transforms any wall, fence, or trellis into a cascade of colour. Flowers open each morning in the most vivid blues and purples.</p><ul>\n<li>Trumpet-shaped blooms in vivid blue, purple, pink, red, and white.</li>\n<li>Fast-growing climber that covers fences, railings, and trellises with ease.</li>\n<li>Flowers every morning from June onwards, adding daily colour to your outdoor space.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long.</li>\n</ul><p>Number of seeds per gram (aprox): 23</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41257051750532",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO049"
      },
      {
        "id": "41257051783300",
        "title": "25 gm",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": true,
        "sku": "NUFSO050"
      }
    ]
  },
  {
    "id": "6941002596484",
    "handle": "gallardia-seeds",
    "title": "Gaillardia Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 277,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w42FvU57EI.jpg?v=1789365345",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w42FvU57EI.jpg?v=1789365345",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/03.GallardiaSeeds.jpg?v=1756472654"
    ],
    "descriptionHtml": "<p>Gaillardia, or Blanket Flower, is one of the most vivid and heat-tolerant flowering plants you can grow in India. Fiery red and orange blooms that keep going through the warmest months with very little care.</p><ul>\n<li>Vivid red, orange, and yellow daisy-like blooms that flower continuously through warm months.</li>\n<li>Extremely heat and drought tolerant; thrives when other flowers struggle.</li>\n<li>A magnet for butterflies and bees; great for pollinator-friendly gardens.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long.</li>\n</ul><p>Number of seeds per gram (aprox): 645</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859365507204",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO039"
      }
    ]
  },
  {
    "id": "6941000990852",
    "handle": "salvia-red-seeds",
    "title": "Salvia Red Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 155,
    "compareAtPrice": 155,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 291,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SalviaRedSeeds.jpg?v=1686290015",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/SalviaRedSeeds.jpg?v=1686290015"
    ],
    "descriptionHtml": "<p>Salvia Red is one of the most vivid and heat-tolerant flowers you can grow in India. Brilliant scarlet spikes that butterflies adore, blooming all through the warm season with very little fuss.</p><ul>\n<li>Brilliant scarlet flower spikes that attract butterflies and bees.</li>\n<li>Heat-loving and drought tolerant; perfect for Indian summer gardens.</li>\n<li>Long-blooming through the warm months with minimal attention.</li>\n<li>Grow it organically with Ugaoo's Potting Mix, vivid blooms all season long.</li>\n</ul><p>Number of seeds per gram (aprox): 310</p>",
    "tags": [
      "Aroma",
      "flower-seed"
    ],
    "variants": [
      {
        "id": "40859360854148",
        "title": "Default Title",
        "price": 155,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO075"
      }
    ]
  },
  {
    "id": "6941004300420",
    "handle": "star-phlox-mix-seeds",
    "title": "Star Phlox Mix Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 269,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/StartPhloxMockup.jpg?v=1687330055",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/StartPhloxMockup.jpg?v=1687330055"
    ],
    "descriptionHtml": "<p>Star Phlox Mix is a cheerful cool-season flower with distinctive five-petalled star-shaped blooms in a beautiful mix of colours. A reliable, easy-growing winter flower for Indian gardens and balconies.</p><ul>\n<li>Star-shaped blooms in vivid pink, red, white, purple, and mixed varieties.</li>\n<li>A cheerful cool-season flower that thrives through Indian winters.</li>\n<li>Great for borders, pots, window boxes, and as cut flowers.</li>\n<li>Grow it organically with Ugaoo's Potting Mix, beautiful blooms all winter long.</li>\n</ul><p>Number of seeds per gram (aprox): 594</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859370619012",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO0111"
      }
    ]
  },
  {
    "id": "6941001482372",
    "handle": "celosia-cristata-seeds",
    "title": "Celosia Cristata Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 152,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_lJiCmG8gv9.jpg?v=1788875848",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_lJiCmG8gv9.jpg?v=1788875848",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_2_dc3bf1b5-bbc4-472e-b756-a47124ebce07.jpg?v=1788875476",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_72a60c8e-5b2e-479e-8264-ba8b6c9c02f8.jpg?v=1788875744",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_e2430889-51f6-4925-a0ab-deab3b19336e.jpg?v=1788875850",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_eff67d6d-8f5b-4ddb-a4c3-77d22e9bcd27.jpg?v=1788875877",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/70_d737c36f-0354-42cf-96c3-02291485f4d2.jpg?v=1788875714"
    ],
    "descriptionHtml": "<p>Celosia Cristata, or Cockscomb, is one of the most distinctive-looking flowers in any garden. Its velvety, crested or brain-shaped flower heads in vivid jewel colours are impossible to ignore.</p><ul>\n<li>Unique velvety crested flower heads in vivid shades of red, orange, pink, yellow, and gold.</li>\n<li>Excellent for fresh and dried flower arrangements; retains colour and form when dried.</li>\n<li>Heat tolerant and long-blooming; thrives in Indian summer.</li>\n<li>Grow it organically in Ugaoo's Potting Mix, vibrant blooms all season long.</li>\n</ul><p>Number of seeds per gram (aprox): 1642</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859361968260",
        "title": "Default Title",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO019"
      }
    ]
  },
  {
    "id": "6940981493892",
    "handle": "balsam-mix-seeds",
    "title": "Balsam Mix Seeds",
    "category": "seeds",
    "subCategory": "flower-seeds",
    "price": 99,
    "compareAtPrice": 155,
    "discountPercent": 36,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 169,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_Lw9KRU6swO.jpg?v=1788609426",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_Lw9KRU6swO.jpg?v=1788609426",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_4_e1141e7c-d31a-4e66-967a-fb29feef4df6.jpg?v=1788609438",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_4_81f4054b-d2dc-4a96-a83f-2980ed870089.jpg?v=1788609454",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_4_c20e465c-29d4-4f32-8b00-1cd0342d7d40.jpg?v=1788609472",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-08_1_646038ac-1677-499f-afe7-0c4b8d955966.jpg?v=1788609492",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-09_1_d7f1109b-678e-494d-b1a2-986299e1adfe.jpg?v=1788609508"
    ],
    "descriptionHtml": "<p>Balsam Mix is a colourful, easy-to-grow flowering plant. It's known for thriving even in monsoon humidity. A cheerful choice for Indian gardens.</p><ul>\n<li>Produces dense, rose-like double blooms in pink, red, purple, and white</li>\n<li>One of the few flowering annuals that grows beautifully through the monsoon</li>\n<li>Great for borders, pots, garden beds, and shaded balconies</li>\n<li>Grow it organically in Ugaoo's Potting Mix, chemical-free blooms all season long</li>\n</ul><p>Number of seeds per gram (aprox): 174</p>",
    "tags": [
      "Aroma",
      "flower-seed",
      "retail-store"
    ],
    "variants": [
      {
        "id": "41278619091076",
        "title": "1 gm",
        "price": 99,
        "compareAtPrice": 155,
        "available": true,
        "sku": "NUFSO011"
      },
      {
        "id": "41278619123844",
        "title": "25 GM",
        "price": 1275,
        "compareAtPrice": 1275,
        "available": false,
        "sku": "NUFSO012"
      }
    ]
  },
  {
    "id": "6940814868612",
    "handle": "thyme-750-seeds",
    "title": "Thyme Seeds",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 250,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_u5L505aQLD.jpg?v=1788767576",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_u5L505aQLD.jpg?v=1788767576",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_5_a9b4afbf-9284-471b-bf62-597085f59e05.jpg?v=1788767641",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_5_db8e1a43-b31c-46d6-b801-a9bad9eb490b.jpg?v=1788767577",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_5_df5f66fd-0bff-41ce-89b9-c54e98a7a944.jpg?v=1788767623",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_2-02_4_210f3d78-9b2e-476f-8032-9ca6d3a1ba01.jpg?v=1788767595",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-07_4_a547f1ef-52b6-49ae-ae03-b996c662f96d.jpg?v=1788767608"
    ],
    "descriptionHtml": "<p>Thyme is a low-growing, aromatic herb. It's valued for its intense flavour and fragrance. A great addition to home kitchen gardens.</p><ul>\n<li>Rich in vitamin C, vitamin A, iron, and antioxidants</li>\n<li>One of the easiest ways to add fresh herb flavour to everyday cooking</li>\n<li>Toss it into soups, roasted vegetables, marinades, or herbal teas</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free thyme all year round</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40858925072516",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO041"
      }
    ]
  },
  {
    "id": "6940813820036",
    "handle": "chives-seeds",
    "title": "Chives Seeds",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 250,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_EbLlNh8uuO.jpg?v=1788790058",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_EbLlNh8uuO.jpg?v=1788790058",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_5_8cdf02cd-bb17-4ffc-8e6a-6e400efa1032.jpg?v=1788790472",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_5_14275001-4e1d-474a-b702-a73f63ea3494.jpg?v=1788790042",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_5_defc0768-2544-47b7-b377-2322c0f5c59f.jpg?v=1788790257",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_2-02_4_a36d1214-6e8b-45ad-b338-f60289bcbe07.jpg?v=1788790043",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-07_4_73593605-69f1-4e18-a9b8-89f2c09cf748.jpg?v=1788790245"
    ],
    "descriptionHtml": "<p>Chives are a mild, easy-growing herb with thin hollow leaves and a gentle onion flavour. A kitchen garden staple that keeps giving back season after season.</p><ul>\n<li>Thin, hollow leaves with a mild onion and garlic flavour.</li>\n<li>Rich in vitamin C, vitamin K, and folate.</li>\n<li>Perfect as a fresh garnish on dips, soups, eggs, pasta, and sandwiches.</li>\n<li>Grow it organically in Ugaoo's Organic Veggie Mix, chemical-free chives all year round.</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40858924187780",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO011"
      }
    ]
  },
  {
    "id": "6940965077124",
    "handle": "purple-basil-seeds",
    "title": "Purple Basil Seeds",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 122,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_8aqG3mXIrU.jpg?v=1788868828",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_8aqG3mXIrU.jpg?v=1788868828",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2.jpg?v=1788868874",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_360f8c5c-55b8-43b4-beb4-f77ff6c721be.jpg?v=1788869058",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_0880083c-254a-4943-8d05-30d6e0e7192f.jpg?v=1788868651",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_1e8d48f3-b4b1-4318-bbd6-56d3e00fde8f.jpg?v=1788868754",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80.jpg?v=1788868738"
    ],
    "descriptionHtml": "<p>Purple Basil is Italian Basil's more dramatic sibling - deep, glossy purple leaves with an equally rich, slightly spicier flavour and stunning visual presence in any garden or kitchen.</p><ul>\n<li>Deep purple leaves with a rich, slightly spicier flavour than regular green basil.</li>\n<li>Rich in vitamins A, C, and K and packed with powerful antioxidants.</li>\n<li>Stunning in pesto, pasta, salads, and as a visual garnish.</li>\n<li>Grow it organically in Ugaoo's Organic Veggie Mix, chemical-free herb all season long.</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859229356164",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO071"
      }
    ]
  },
  {
    "id": "6940814606468",
    "handle": "sage-seeds",
    "title": "Sage Seeds",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 230,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/sage-seeds-31901857742980.jpg?v=1675615148",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/sage-seeds-31901857742980.jpg?v=1675615148"
    ],
    "descriptionHtml": "<p>Sage is a woody, aromatic perennial herb with a rich, earthy flavour that makes it invaluable in the kitchen. Slow to start but once established, it provides years of harvest.</p><ul>\n<li>Intense, aromatic leaves rich in vitamin K and antioxidants.</li>\n<li>Great in pasta, roasted vegetables, butter sauces, herbal teas, and marinades.</li>\n<li>A long-lived perennial that keeps producing for years with minimal care.</li>\n<li>Grow it organically in Ugaoo's Organic Veggie Mix for a healthy, chemical-free herb at home.</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40858925006980",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO036"
      }
    ]
  },
  {
    "id": "6940637462660",
    "handle": "herb-seeds-bundle-of-5-packet-1",
    "title": "Herb Seeds Bundle of 5 Packet",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 495,
    "compareAtPrice": 845,
    "discountPercent": 41,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 207,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5.UgaooHerbSeeds.jpg?v=1707743972",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5.UgaooHerbSeeds.jpg?v=1707743972"
    ],
    "descriptionHtml": "Don't let unavailability of fresh herbs hold you back from your global culinary dreams, grow your own herbs with our herb seeds combo pack. These easy to grow herb varieties grow very well in planters and are extremely suitable for new home gardeners. They not only make your food taste better by taking it up a few notches, it also makes you home garden smell divine and has multiple medicinal uses.",
    "tags": [
      "Fresh",
      "herb-seeds"
    ],
    "variants": [
      {
        "id": "40858550141060",
        "title": "Default Title",
        "price": 495,
        "compareAtPrice": 845,
        "available": true,
        "sku": "NUHSOC02"
      }
    ]
  },
  {
    "id": "6940814049412",
    "handle": "fennel-seeds",
    "title": "Fennel Seeds",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 60,
    "inStock": true,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w42FfZU7EI.jpg?v=1788876251",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_w42FfZU7EI.jpg?v=1788876251",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_2_4d45ceb0-ccff-4b44-8bda-cf2e7d4e9b89.jpg?v=1788876177",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_6_3cb6fa7f-8f03-4db6-9497-9f28087063be.jpg?v=1788876680",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_6_2416387f-0837-4182-a0f3-5bd207333808.jpg?v=1788876918",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_6_8bee4433-ef07-446c-b648-00682afd1ceb.jpg?v=1788876796",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/80_97a43d32-029c-4e55-9fd2-7bce77c2e5f6.jpg?v=1788876150"
    ],
    "descriptionHtml": "<p>Fennel (Saunf) is one of the most useful herbs in an Indian kitchen garden. The feathery fronds flavour curries, the stems add crunch to salads, and the seeds serve as both a cooking spice and an after-meal digestive.</p><ul>\n<li>Feathery, anise-scented fronds and seeds used daily in Indian cooking and as a digestive.</li>\n<li>Rich in vitamin C, fibre, potassium, and antioxidants.</li>\n<li>Provides harvests at multiple stages: leaves, stems, and seeds.</li>\n<li>Grow it organically in Ugaoo's Organic Veggie Mix, chemical-free saunf at home.</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40858924417156",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": true,
        "sku": "NUHSO021"
      }
    ]
  },
  {
    "id": "6940965339268",
    "handle": "thai-basil-1000-seeds",
    "title": "Thai Basil (1000 Seeds)",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 86,
    "inStock": false,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_dtEt9BIXSL.jpg?v=1788789858",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/ugaoo_generate-a-hero-product-s_dtEt9BIXSL.jpg?v=1788789858",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_3-03_5_d97d3dc3-c18f-42f9-9a8d-49ce52740965.jpg?v=1788790218",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_4-04_5_d3a721b2-bd5f-42b2-93a0-75c14b20f7b7.jpg?v=1788789856",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_5_5_85e564b6-82ef-47ea-9ea5-4d6a6e398502.jpg?v=1788789942",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach_Artboard_2-02_4_11011ffe-2e68-4529-9783-a1f1def5a3b7.jpg?v=1788789957",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Spinach-07_4_cc509f53-90df-45fa-b0ac-6ffa0ffaebb6.jpg?v=1788789873"
    ],
    "descriptionHtml": "<p>Thai basil is a fragrant, spicy-sweet herb. It's a staple in Southeast Asian and Indian kitchens alike. Easy to grow and quick to bounce back after cutting.</p><ul>\n<li>Rich in antioxidants, vitamin A, and essential oils</li>\n<li>One of the easiest ways to bring bold, aromatic flavour into everyday cooking</li>\n<li>Toss it into stir-fries, soups, curries, or fresh herbal teas</li>\n<li>Grow it organically in Ugaoo's Veggie Mix Soil, chemical-free basil all year round</li>\n</ul>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds",
      "retail-store"
    ],
    "variants": [
      {
        "id": "40859229618308",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": false,
        "sku": "NUHSO076"
      }
    ]
  },
  {
    "id": "6940992307332",
    "handle": "dill-leaves-seeds-suwa",
    "title": "Dill Leaves Seeds (Suwa)",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 195,
    "compareAtPrice": 195,
    "discountPercent": 20,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 116,
    "inStock": false,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_13_24c76e2b-2bb5-4cea-aa05-b45a82cb88e4.jpg?v=1792267416",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/1_13_24c76e2b-2bb5-4cea-aa05-b45a82cb88e4.jpg?v=1792267416",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/2_10_d2fd3926-579e-49e5-9006-a32ee8c24d38.jpg?v=1792267397",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/3_12_3fb6fe8d-58b8-4461-9040-874ecd4198da.jpg?v=1792267383",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/4_13.jpg?v=1792267365",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/5_13.jpg?v=1792267351",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/6_11.jpg?v=1792267337",
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/7_12_8d24a110-5e3d-4478-b593-deec6d305972.jpg?v=1792742022"
    ],
    "descriptionHtml": "<p>Dill (Suwa) is a feathery, aromatic herb that grows quickly and adds a distinctive freshness to Indian cooking. Both the leaves and seeds are useful in the kitchen.</p><ul>\n<li>Aromatic feathery leaves with a fresh, anise-like taste.</li>\n<li>Rich in vitamin C, calcium, and iron.</li>\n<li>Used in Gujarati dal, fish curries, sabzi, raita, and fresh chutneys.</li>\n<li>Grow it organically in Ugaoo's Organic Veggie Mix, chemical-free suwa whenever you need it.</li>\n</ul><p><strong>Approx. seeds per gram:</strong> 394</p>",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds"
    ],
    "variants": [
      {
        "id": "40859336507524",
        "title": "100 gm",
        "price": 195,
        "compareAtPrice": 195,
        "available": false,
        "sku": "NUVSO173"
      },
      {
        "id": "40859336540292",
        "title": "250 gm",
        "price": 315,
        "compareAtPrice": 315,
        "available": false,
        "sku": "NUVSO174"
      }
    ]
  },
  {
    "id": "6940906848388",
    "handle": "marjoram-seeds",
    "title": "Marjoram Seeds",
    "category": "seeds",
    "subCategory": "herb-seeds",
    "price": 119,
    "compareAtPrice": 175,
    "discountPercent": 32,
    "currency": "INR",
    "rating": 4.8,
    "reviewCount": 173,
    "inStock": false,
    "thumbnail": "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/05.MarjoramSeeds.jpg?v=1687329699",
    "images": [
      "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/05.MarjoramSeeds.jpg?v=1687329699"
    ],
    "descriptionHtml": "More commonly known as sweet marjoram, a member of the mint family, it is native to the Mediterranean and Western Asia. It has a similar taste profile to oregano but is milder and is used to flavour salads, soups and granish meat dishes. This easy to grow herb is a perennial and loves full sun and a well draining soil.",
    "tags": [
      "Aroma",
      "Fresh",
      "herb-seeds"
    ],
    "variants": [
      {
        "id": "40859122139268",
        "title": "Default Title",
        "price": 119,
        "compareAtPrice": 175,
        "available": false,
        "sku": "NUHSO051"
      }
    ]
  }
]

export const PLANT_LISTINGS = PLANT_AND_SEED_LISTINGS.filter((item) => item.category === 'plants')
export const SEED_LISTINGS = PLANT_AND_SEED_LISTINGS.filter((item) => item.category === 'seeds')

export function getListingByHandle(handle: string): BotanicalListingItem | undefined {
  return PLANT_AND_SEED_LISTINGS.find((item) => item.handle === handle)
}
