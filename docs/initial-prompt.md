# Wardrobe Vault — Master Development Prompt

> Companion documents: `TECH-SPEC-ADDENDUM.md` (technical decisions), `AGENTS.md` (AI agent rules), `CLAUDE.md` (agent orientation). This file is the source of truth for product, UX, and business rules. The tech-spec addendum is the source of truth for implementation details.

---

## Table of Contents

**Vision & Brand**
1. [Project Vision](#1-project-vision)
2. [Development Approach](#2-development-approach)
3. [Brand Identity](#3-brand-identity)

**Design System**
4. [Design Philosophy](#4-design-philosophy)
5. [Color System](#5-color-system)
6. [Typography](#6-typography)

**Core Experience**
7. [Overall User Experience](#7-overall-user-experience)
8. [Homepage](#8-homepage)
9. [Featured Vault](#9-featured-vault)
10. [Product / Item Cards](#10-product--item-cards)
11. [Item Detail Page](#11-item-detail-page)
12. ["Worn By" Experience](#12-worn-by-experience)
13. [Verified Public Figures](#13-verified-public-figures)

**Selling & Moderation**
14. [Selling](#14-selling)
15. [Draft Listings](#15-draft-listings)
16. [Admin Approval System](#16-admin-approval-system)
17. [Admin Listing Review](#17-admin-listing-review)

**Money: Buying, Commission, Payouts**
18. [Buying Flow](#18-buying-flow)
19. [Platform Commission](#19-platform-commission)
20. [Payout System](#20-payout-system)
21. [Payment Architecture](#21-payment-architecture)
22. [Shipping](#22-shipping)
23. [Order System](#23-order-system)

**User-Facing Areas**
24. [User Dashboard](#24-user-dashboard)
25. [Search and Discovery](#25-search-and-discovery)
26. [Categories](#26-categories)
27. [Wishlist](#27-wishlist)
28. [User Profiles](#28-user-profiles)
29. [Authentication](#29-authentication)

**Admin & Trust**
30. [Admin Dashboard](#30-admin-dashboard)
31. [Admin Security](#31-admin-security)
32. [Trust and Authenticity](#32-trust-and-authenticity)
33. [Reporting](#33-reporting)
34. [Notifications](#34-notifications)

**Interface Quality**
35. [Responsive Design](#35-responsive-design)
36. [Animations](#36-animations)
37. [Image Presentation](#37-image-presentation)
38. [Empty States](#38-empty-states)
39. [Error States](#39-error-states)

**Engineering Foundations**
40. [Database Design](#40-database-design)
41. [Data Security](#41-data-security)
42. [Admin Audit Log](#42-admin-audit-log)
43. [Financial Transparency](#43-financial-transparency)

**Voice, Scope & Final Checks**
44. [Brand Voice](#44-brand-voice)
45. [Anti-AI-Design Rule](#45-anti-ai-design-rule)
46. [MVP Priority](#46-mvp-priority)
47. [Future Features](#47-future-features)
48. [Important Business Rule](#48-important-business-rule)
49. [Purchase Safety](#49-purchase-safety)
50. [Final Design Test](#50-final-design-test)
51. [Final Product Experience](#51-final-product-experience)
52. [Implementation Instruction](#implementation-instruction)

---

## 1. Project Vision

Build a premium web application called **Wardrobe Vault**.

Wardrobe Vault is an exclusive fashion resale marketplace where people can buy and sell exceptional clothing, accessories, shoes, gowns, suits, jewelry, handbags, and other fashion pieces that have previously been worn for significant events or owned by notable people.

**The core concept:**

> Don't just buy the fashion. Own the story behind it.

The platform makes it possible for someone to purchase an actual fashion piece previously worn by a celebrity, socialite, influencer, public figure, model, artist, entrepreneur, or other notable person.

**Example flow:**
1. A celebrity wore a designer gown to an awards ceremony.
2. They don't want to wear it again.
3. Instead of it sitting unused in their wardrobe, they list it on Wardrobe Vault.
4. A buyer discovers the exact piece.
5. The buyer purchases it through Wardrobe Vault.
6. Wardrobe Vault holds the payment.
7. After the transaction is confirmed and approved, the seller receives their money minus Wardrobe Vault's commission.

**The platform should feel like a combination of:**
- A luxury fashion archive
- An exclusive resale marketplace
- A celebrity wardrobe marketplace
- A curated fashion gallery
- A digital fashion vault

This is **not** a normal e-commerce website. It should feel prestigious, editorial, sophisticated, trustworthy, exclusive, and highly curated.

---

## 2. Development Approach

Start with a **web application only**.

The architecture should be designed so the application can later expand into:
- iOS
- Android
- PWA
- Mobile applications
- Additional marketplace functionality

Do not over-engineer the first version. Build a strong MVP first while keeping the architecture scalable.

---

## 3. Brand Identity

**Brand Name:** WARDROBE VAULT

- The name should be displayed elegantly.
- Avoid excessive logos, icons, gradients, or decorative elements.
- The brand should feel established — as if Wardrobe Vault has already existed for years.

---

## 4. Design Philosophy

The most important design requirement is **quiet luxury**.

**Do NOT use the stereotypical AI luxury aesthetic.** Absolutely avoid:

- Excessive gold
- Purple gradients
- Black-and-gold combinations everywhere
- Neon effects
- Glassmorphism everywhere
- Excessive glowing effects
- Huge gradients
- Generic AI dashboard layouts
- Excessive rounded cards
- Overuse of shadows
- Excessive animations
- Futuristic sci-fi aesthetics
- Template-looking interfaces
- Crowded screens
- Too many icons
- Excessive decorative elements

The website should look like it was designed by a highly experienced luxury fashion creative director. Think:

- Editorial fashion magazine
- High-end fashion house
- Contemporary luxury retailer
- Fashion archive
- Gallery
- Art catalogue

**The design should communicate:** exclusive + refined + modern + expensive + trustworthy + understated.

**Luxury should come from:**
- Typography
- Spacing
- Photography
- Layout
- Material feeling
- Editorial composition
- Consistency
- Restraint

**Not** from gold effects.

---

## 5. Color System

Use a sophisticated neutral palette, inspired by:

- Warm ivory
- Soft cream
- Off-white
- Charcoal
- Deep espresso
- Muted taupe
- Soft stone
- Very subtle muted accent colors

Use one restrained accent color if necessary. Do not make the interface colorful — the clothing itself should provide most of the visual color. The website should act as a beautiful frame around the fashion.

---

## 6. Typography

Typography is extremely important.

- Use an elegant editorial **serif** font for major headings and a clean modern **sans-serif** for interface elements.
- The typography hierarchy should feel intentional.

**Example:**
```
WARDROBE VAULT          ← Large editorial heading
"Pieces with a story."  ← Small supporting text
```

Avoid generic typography combinations that make the website immediately look AI-generated.

**Use:**
- Large elegant headings
- Generous line height
- Carefully controlled letter spacing
- Strong hierarchy
- Short copy
- Plenty of whitespace

---

## 7. Overall User Experience

There are two primary areas: **User Side** and **Admin Side**.

### User Side
Users can:
- Create an account
- Browse fashion
- Search
- Filter
- View listings
- View seller profiles
- View verified public figures
- Purchase items
- Add items to wishlist
- Add their own items
- Save listings as drafts
- Submit listings for approval
- Manage their listings
- Track purchases
- View transaction history
- Manage their profile
- Receive notifications

### Admin Side
Administrators can:
- Review users
- Approve sellers
- Verify public figures
- Approve/reject listings
- Review purchases
- Confirm payments
- Manage commissions
- Approve seller payouts
- Manage disputes
- Manage reported listings
- Manage categories
- Manage platform settings
- View marketplace analytics

**The admin dashboard should be completely separate from the normal user experience.**

---

## 8. Homepage

Create a stunning editorial homepage. Do **not** make it look like a conventional online store — it should immediately communicate the concept.

**Hero section:**
```
WARDROBE VAULT
"Own a piece of someone's story."
```
Supporting text explains that users can discover exceptional fashion pieces previously worn, owned, or featured by notable people.

- **Primary CTA:** Explore the Vault
- **Secondary CTA:** Sell a Piece

Use a large editorial fashion image or carefully designed image composition. The hero should have significant whitespace.

---

## 9. Featured Vault

Create a section showcasing exceptional pieces, e.g.:
- Recently Added
- Most Coveted
- Worn by Icons
- The Editorial Edit
- Rare Finds
- Under the Spotlight
- Recently Sold

Do not show dozens of products immediately — use carefully selected items. Each item should feel like an exhibit.

---

## 10. Product / Item Cards

Product cards should **not** resemble generic Amazon-style cards.

**Each listing displays:**
- High-quality image
- Item name
- Designer/brand
- Price
- Seller
- Verification badge where applicable
- "Worn By" information where applicable
- Event information where applicable

**Example:**
```
Silk Evening Gown
Dior
Worn by: [Public Figure]
Met Gala 2025
$2,800
```

The "Worn By" information should be visually important.

---

## 11. Item Detail Page

One of the most important pages. Make it feel like an editorial fashion archive, with a large image gallery.

**Include:**
- Main image
- Additional images
- Close-up images
- Designer label
- Condition
- Size
- Material
- Color
- Year
- Original purchase information where available
- Event worn at
- Date worn
- Number of times worn
- Seller information
- Price
- Authenticity information
- Verification status
- Story behind the piece

### The Story

Every premium listing should have a storytelling section.

> "This gown was worn by [Name] during..."

Presented elegantly. If evidence is uploaded, display **"Verified Story."** If information has not been independently verified, clearly indicate that. **Never falsely claim celebrity ownership or usage.**

---

## 12. "Worn By" Experience

A dedicated concept around the person who previously wore or owned the item.

If the seller is a verified public figure, display **"VERIFIED PUBLIC FIGURE"** with a tasteful verification badge. Users can click through to that person's public profile.

**Example:**
```
WORN BY
[Name]
Verified Public Figure
Profession / Public Role
"View their Vault"
```

Their profile shows pieces they have listed.

---

## 13. Verified Public Figures

Anyone can register and sell, but public figures can receive a special verification badge.

**Verification must NEVER happen automatically — admin approval required.**

**Possible verification statuses:**
- Unverified
- Verification Pending
- Verified Public Figure
- Verification Revoked

Only administrators can assign or remove verified status. The badge should be subtle and premium — **not** a huge blue social-media-style badge.

---

## 14. Selling

Users see a clear **"Add to Vault"** button and are guided through an elegant listing process.

### Basic Information
- Item title
- Category
- Brand/designer
- Price
- Currency
- Size
- Color
- Material
- Condition

### Story
- Who wore it?
- Was it worn by the seller?
- Where was it worn?
- Event name
- Event date
- Number of times worn
- Story/details

### Authenticity
- Proof of purchase
- Designer documentation
- Certificates
- Event photographs
- Ownership documentation
- Other supporting evidence

### Images
Allow multiple high-quality photographs. Recommended: front, back, side, detail, label, packaging, proof/documentation where appropriate.

---

## 15. Draft Listings

Users must be able to save an unfinished listing as **Draft**. They should not be forced to complete every field before saving, and can return later to continue editing.

**Drafts must NOT appear publicly.**

---

## 16. Admin Approval System

Every new listing goes through moderation.

**Flow:**
```
User creates listing
   ↓
Save as Draft
   ↓
Submit for Review
   ↓
Admin Reviews
   ↓
   ├─ Approved  → Listing goes live
   └─ Rejected  → User receives reason, can edit/resubmit
```

Admin can provide rejection reasons.

**Possible statuses:** Draft · Submitted · Under Review · Approved · Rejected · Published · Sold · Suspended · Archived

---

## 17. Admin Listing Review

**Administrators see:**
- Seller
- Listing
- Images
- Price
- Description
- Claimed previous wearer
- Event
- Verification documents
- Authenticity evidence
- Submission date
- Previous moderation history

**Admin actions:** Approve · Reject · Request Changes · Suspend · Archive

Admin can leave internal notes.

---

## 18. Buying Flow

When a buyer clicks **Purchase**, show a clean checkout experience.

**Buyer reviews:**
- Item
- Seller
- Price
- Wardrobe Vault commission if applicable
- Shipping fee
- Total amount

Payment is then processed through Wardrobe Vault.

> **Important:** The buyer's payment does **not** immediately go directly to the seller. Funds initially go to the Wardrobe Vault platform/payment system. The seller receives their payout after the appropriate transaction conditions and admin approval have been satisfied.

---

## 19. Platform Commission

Wardrobe Vault earns a percentage from each successful sale.

**Example:**
| | |
|---|---|
| Item price | $2,000 |
| Wardrobe Vault commission (10%) | $200 |
| Seller receives | $1,800 |

The commission percentage must be **configurable by administrators** — never hard-coded.

**Admin can configure:**
- Default commission
- Seller-specific commission if needed
- Promotional commission
- Category-specific commission

Every transaction must store a clear financial breakdown.

---

## 20. Payout System

Create a seller wallet/earnings area. After a successful sale, the seller can see:
- Sale Amount
- Wardrobe Vault Commission
- Net Earnings
- Payout Status

**Possible payout statuses:** Pending · Approved · Processing · Paid · Failed · On Hold

Administrators must approve seller payouts. **Sellers can never manually mark themselves as paid** — only the platform/payment system or an authorized administrator can change payout status.

---

## 21. Payment Architecture

Design the payment architecture so it can support real payment providers later.

For the MVP, payment functionality can use a safe test/mock payment system if real payment gateway integration is not available. **Do not pretend a mock payment is a real financial transaction.**

The architecture should eventually support payment providers appropriate to the target markets.

---

## 22. Shipping

Each seller provides shipping information as part of a listing:
- Shipping availability
- Shipping regions
- Shipping fee
- Estimated delivery time

Buyer sees shipping costs before completing checkout.

**Order statuses:** Order Placed · Payment Confirmed · Awaiting Seller · Shipped · In Transit · Delivered · Completed · Disputed · Cancelled

---

## 23. Order System

Every purchase creates an order containing:
- Unique order ID
- Buyer
- Seller
- Item
- Price
- Commission
- Shipping
- Total
- Payment status
- Fulfillment status
- Payout status
- Dates
- Tracking information

---

## 24. User Dashboard

Keep the user dashboard elegant and simple.

**Navigation:** Discover · My Vault · Sell · Orders · Wishlist · Messages/Notifications · Profile

**"My Vault" contains:**
- **My Listings** — Published / Drafts / Under Review / Sold / Rejected
- **My Purchases** — Active orders / Completed purchases
- **Saved** — Wishlist

Do not make the dashboard feel like an accounting application — it should still feel like a luxury fashion platform.

---

## 25. Search and Discovery

**Search by:** Item · Brand · Designer · Public figure · Category · Event · Size · Price · Condition · Location

**Filters:** Price · Category · Designer · Size · Condition · Verified public figure · Recently added · Most coveted · Available · Sold

---

## 26. Categories

Dresses · Gowns · Suits · Jackets · Shoes · Handbags · Jewelry · Accessories · Streetwear · Menswear · Womenswear · Vintage · Designer · Other

Administrators can create additional categories.

---

## 27. Wishlist

Users can add to wishlist, remove from wishlist, and view saved pieces.

**Potential future functionality:** notify users when price changes, an item is about to sell, or a similar item is listed.

---

## 28. User Profiles

Profiles should feel elegant rather than social-media-like.

**Show:** Profile photograph · Name · Verified status · Short biography · Location/general region · Items currently listed · Sold pieces if appropriate

For verified public figures, provide a stronger editorial profile.

---

## 29. Authentication

Users can: Register · Log in · Log out · Reset password · Manage profile

**Potential future options:** Google login, Apple login, other OAuth providers.

Use secure authentication practices. **Never store plaintext passwords.**

---

## 30. Admin Dashboard

A completely separate administrative interface.

**Sections:**

- **Overview** — total users, active listings, pending approvals, total sales, platform revenue, pending payouts, orders, disputes
- **Users** — view, search, suspend users; review seller activity
- **Verification** — public figure applications, evidence, approve/reject/revoke verification
- **Listings** — pending / approved / rejected / suspended / sold
- **Orders** — all orders, payment status, shipping status, disputes
- **Payouts** — pending / approved / completed
- **Transactions** — financial history
- **Categories** — manage marketplace categories
- **Settings** — commission, currency, marketplace settings, verification rules, shipping settings

---

## 31. Admin Security

The admin section must be protected. Regular users must **never** be able to access administrative functionality simply by changing a URL.

Implement proper authorization using **role-based access control**.

**Roles:** User · Verified Public Figure · Moderator · Administrator · Super Administrator

Only authorized roles can perform sensitive actions.

---

## 32. Trust and Authenticity

The platform must distinguish between:

| | |
|---|---|
| **Seller claimed** | Information provided by the seller |
| **Verified** | Information reviewed and approved by Wardrobe Vault |

Do not automatically label an item "authentic" simply because a seller uploaded it.

**Potential verification evidence:** purchase receipt, designer invoice, certificate, event photographs, original packaging, ownership documentation, other supporting evidence.

---

## 33. Reporting

Users can report listings for:
- Suspected counterfeit
- False celebrity claim
- Misleading description
- Inappropriate content
- Fraud concern
- Other

Admins can investigate and take action.

---

## 34. Notifications

Users receive notifications for:
- Listing approved
- Listing rejected
- Listing needs changes
- Item sold
- Purchase confirmed
- Order shipped
- Order delivered
- Payout approved
- Payout completed
- Verification approved/rejected

Keep notifications clean and useful.

---

## 35. Responsive Design

Must work beautifully on desktop, laptop, tablet, and mobile.

**Do not simply shrink the desktop layout** — design mobile layouts intentionally. The mobile experience should still feel premium.

---

## 36. Animations

Use subtle animation: elegant page transitions, image fade-ins, gentle hover effects, smooth modal transitions, subtle button interactions, soft image scaling.

**Avoid:** bouncing elements, excessive parallax, flashy transitions, loading animations everywhere, unnecessary motion.

Animation should feel expensive, not distracting.

---

## 37. Image Presentation

Fashion photography is extremely important. Use large, high-quality imagery with consistent presentation.

**Allow:** multiple images, zoom, full-screen gallery, image thumbnails.

Do not distort uploaded images — use appropriate aspect ratios and responsive image handling.

---

## 38. Empty States

Do not show ugly generic empty states.

Instead of *"No products found,"* use elegant copy such as:
- "The Vault is quiet here."
- "Nothing has been placed in this collection yet."

Maintain the brand voice.

---

## 39. Error States

Errors should be understandable and human. Avoid technical-looking messages like *"Error 500."*

Instead: *"Something went wrong while opening this piece. Please try again."*

Log technical details internally.

---

## 40. Database Design

Create a proper relational database.

**Suggested core tables:**
```
users                       listings                    orders
profiles                    listing_images               order_items
roles                       listing_documents             payments
public_figure_verifications listing_status_history        payouts
categories                  favorites                     wallets
                                                            transactions
shipping_details            notifications                admin_actions
reports                     commission_settings           messages
```

Do not create unnecessary tables just for complexity. Use proper relationships and indexes.

---

## 41. Data Security

Implement: authentication, authorization, role-based access, secure database rules, input validation, file upload validation, secure image/document storage, protection against unauthorized access, and protection against users viewing other users' private information.

**Never expose sensitive payment information unnecessarily.**

---

## 42. Admin Audit Log

Every sensitive administrative action should be recorded — e.g. listing approved/rejected, user suspended, public figure verified, payout approved/cancelled, commission changed.

**Store:** Admin · Action · Target · Timestamp · Relevant details

---

## 43. Financial Transparency

For every sale, maintain a complete transaction record.

**Example:**
| | |
|---|---|
| Item price | $3,000 |
| Platform commission | $300 |
| Shipping | $50 |
| **Buyer total** | **$3,050** |
| Seller earnings | $2,700 |
| Platform revenue | $300 |

**Every amount must be calculated server-side. Never trust amounts submitted by the browser.**

---

## 44. Brand Voice

Copy should be: sophisticated, short, confident, editorial, human, elegant.

**Avoid:** corporate jargon, excessive marketing language, generic AI copy ("Revolutionizing the future of..."), excessive exclamation marks.

**Examples:**
- "A wardrobe with a history."
- "Some pieces deserve another chapter."
- "Enter the Vault."
- "Own what has already been remembered."

Use this tone throughout the platform.

---

## 45. Anti-AI-Design Rule

The application **must not** look like an AI-generated website. Before finalizing any UI, critically review it:

> "Would this look believable as a real luxury fashion startup?"

If the answer is no, redesign it.

**Avoid predictable AI patterns such as:**
- Hero + three glowing cards + gradient background
- Excessive rounded containers
- Generic dashboard cards
- Random purple/blue gradients
- Overuse of icons
- Excessive glass effects
- Generic SaaS UI
- Huge text with meaningless marketing copy

**Instead use:** editorial layouts, strong photography, asymmetrical compositions where appropriate, generous whitespace, high-quality typography, refined borders, restrained interaction, strong visual hierarchy.

---

## 46. MVP Priority

Do not attempt to build every possible future feature immediately. The first functional MVP must prioritize:

- [ ] Landing page
- [ ] User registration/login
- [ ] Marketplace
- [ ] Listing creation
- [ ] Draft listings
- [ ] Admin listing approval
- [ ] Product detail pages
- [ ] Verified public figure system
- [ ] Checkout
- [ ] Orders
- [ ] Payment records
- [ ] Commission calculation
- [ ] Seller earnings
- [ ] Admin payout management
- [ ] User profiles
- [ ] Wishlist
- [ ] Search/filtering
- [ ] Responsive design

Everything else should be architected for future expansion, not built now.

---

## 47. Future Features

Prepare the architecture for, but **do not implement** in the MVP:

- Mobile apps
- Celebrity partnerships
- Fashion-house partnerships
- Authentication partners
- Professional item authentication
- Escrow
- International shipping
- Multi-currency
- Auctions
- Limited drops
- Private sales
- Invitation-only collections
- Personal stylists
- Celebrity-curated collections
- Digital certificates of ownership
- Blockchain-backed provenance if genuinely useful
- AI-assisted item descriptions
- AI image enhancement
- Virtual try-on
- Concierge service

---

## 48. Important Business Rule

Anyone can register and potentially sell. However:

- **No listing becomes public automatically** — every listing must be reviewed and approved by an administrator.
- **Public figure verification is never automatic** — the person applies, provides evidence, and waits for administrative approval.

---

## 49. Purchase Safety

- A seller must **never** be able to manually mark an order as paid.
- A buyer must **never** be able to manipulate the order total.
- Payment confirmation must come from the payment system or authorized administrator during the MVP.
- Payouts must be controlled by the platform.

---

## 50. Final Design Test

After building the application, review it as if you are a celebrity opening the website for the first time. Ask:

- "Would I trust this platform with a $10,000 designer gown?"
- "Would I feel proud sharing my Wardrobe Vault profile?"
- "Does this feel exclusive?"
- "Does this look like a real fashion company?"
- "Does this feel luxurious without screaming luxury?"
- "Does the interface make the clothing the star?"

If not, refine the design.

---

## 51. Final Product Experience

The final experience should feel like entering a private digital fashion archive. A visitor should immediately understand:

- These are not ordinary second-hand clothes.
- These are pieces with history.
- Some were worn to important events.
- Some belonged to recognizable people.
- Some were photographed.
- Some became part of someone's story.
- Now they are available for someone else to own.

**The emotional proposition of Wardrobe Vault:**

> "The moment was theirs. The piece can be yours."

Build the entire application around this idea.

---

## Implementation Instruction

**Do not rush directly into generating code.** First:

1. Understand the complete product requirements.
2. Design the information architecture.
3. Establish the database schema.
4. Establish user roles and permissions.
5. Establish the purchase/payment/payout flow.
6. Establish the listing approval workflow.
7. Establish the verification workflow.
8. Establish the visual design system.

Then build the application systematically.

- Build production-quality code.
- Keep components reusable.
- Keep the codebase organized.
- Do not create fake functionality that appears to work but does not.
- Where external services are unavailable, clearly isolate mock functionality so it can later be replaced with real services.

The result should be a polished, believable, premium marketplace — not a generic AI-generated prototype.
