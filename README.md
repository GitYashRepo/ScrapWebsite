This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




## Folder Structure:-


frontend/
    ├── public/
        ├── Carousel/
            ├── img1.jpg
            ├── img2.jpg
            └── img3.jpg
        ├── Logo/
            ├── KabaadiMandiLogo.png
            ├── logo.png
            └── whatsapp-96.png
        ├── payments/
            ├── googlepay.svg
            ├── mastercard.svg
            ├── paypal.svg
            ├── paytm.svg
            ├── phonepe.svg
            ├── razorpay.svg
            └── visa.svg
        ├── file.svg
        ├── globe.svg
        ├── next.svg
        ├── vercel.svg
        └── window.svg
    ├── src/
        ├── app/
            ├── (auth)/
                ├── signin/
                    ├── admin/
                        └── page.jsx
                    ├── buyer/
                        └── page.jsx
                    ├── seller/
                        └── page.jsx
                    └── page.jsx
                └── signup/
                    └── page.jsx
            ├── about/
                └── page.jsx
            ├── api/
                ├── admin/
                    ├── orders/
                        └── route.js
                    └── users/
                        └── route.js
                ├── auctionproduct/
                    └── route.js
                ├── auth/
                    └── [...nextauth]/
                        └── route.js
                ├── category/
                    ├── [id]/
                        └── route.js
                    └── route.js
                ├── order/
                    ├── [id]/
                        └── route.js
                    └── route.js
                ├── product/
                    ├── [id]/
                        └── route.js
                    ├── auctions/
                        └── route.js
                    └── route.js
                └── signup/
                    ├── admin/
                        └── route.js
                    ├── buyer/
                        └── route.js
                    └── seller/
                        └── route.js
            ├── cart/
                └── page.jsx
            ├── contact/
                └── page.jsx
            ├── dashboard/
                ├── admin/
                    ├── categories/
                        └── page.jsx
                    └── page.jsx
                ├── buyer/
                    ├── auctions/
                        └── page.jsx
                    ├── orders/
                        └── page.jsx
                    ├── product/
                        └── [id]/
                            └── page.jsx
                    └── page.jsx
                └── seller/
                    ├── addauctionproduct/
                        └── page.jsx
                    ├── addproduct/
                        └── page.jsx
                    ├── components/
                        └── ProductForm.jsx
                    └── page.jsx
            ├── orders/
                └── page.jsx
            ├── privay-policy/
                └── page.jsx
            ├── refund-cancellation/
                └── page.jsx
            ├── shipping-policy/
                └── page.jsx
            ├── terms-conditions/
                └── page.jsx
            ├── favicon.ico
            ├── globals.css
            ├── layout.js
            └── page.jsx
        ├── components/
            ├── carousel/
                └── carousel.jsx
            ├── footer/
                └── footer.jsx
            ├── Loader/
                ├── skeletoncard/
                    └── skeleton.jsx
                └── spinner/
                    └── spinner.jsx
            ├── navbar/
                └── navbar.jsx
            ├── Providers/
                └── Providers.jsx
            ├── sidebar/
                └── sidebar.jsx
            ├── singinForm/
                └── SigninForm.jsx
            ├── ui/
                ├── button.jsx
                ├── dropdown-menu.jsx
                ├── input.jsx
                ├── select.jsx
                └── sheet.jsx
            └── whatsapp/
                └── whatsapp.jsx
        ├── lib/
            ├── db/
                └── db.js
            ├── authOptions.js
            └── utils.js
        ├── models/
            ├── admin/
                └── admin.js
            ├── buyer/
                └── buyer.js
            ├── category/
                └── category.js
            ├── order/
                └── order.js
            ├── product/
                └── product.js
            └── user/
                └── seller.js
        ├── utils/
            └── hash.js
        └── middleware.js
    ├── .gitignore
    ├── components.json
    ├── eslint.config.mjs
    ├── jsconfig.json
    ├── next.config.mjs
    ├── note.tldr
    ├── package-lock.json
    ├── package.json
    └── postcss.config.mjs
README.md
