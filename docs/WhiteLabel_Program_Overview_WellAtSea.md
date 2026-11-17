**Eskimo White-Label Program — Process Overview (Corrected)**  
***For:*** * Farah — to use as the base for the Monday process-flow presentation to WellAtSea.*  
 *  
 * ***Prepared by:*** * Nhu Huynh*  
* * ***Date:*** * 2026-08-13*  
 *  
 * ***Change from original doc:*** * the original version (first shared with Bino) implied Eskimo manages pa* *yment and never listed a payment responsibility for the partner — this is the root cause of WellAtSea's original assumption that Eskimo would host payment. Corrected below (changes marked). Reflects the model Lim Swee Mein confirmed on the 2026-08-12 call.*  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAABRAsSdYxKa/i8WMIR7ECt5E2BJsmZmt2gMA4C+Otbqr8+sJAACvXQ85PAYartXEogAAAABJRU5ErkJggg==)  
Eskimo provides a fully hosted eSIM experience under the partner's brand and domain, while managing the underlying platform, eSIM provisioning, usage tracking, and technical infrastructure. **Payment is processed through the partner's own merchant account, configured into the platform** — Eskimo does not hold or process funds on the partner's behalf. *(corrected — original said "...platform, payment, eSIM provisioning..." which implied Eskimo manages payment)*  
**Customer Journey**  
- Customers access the service through a partner-branded domain, for example esim.partner.com.  
- **Plan selection** – Customers browse and select available eSIM data plans under the partner's branding.  
- **Checkout & payment** – Customers complete payment through Stripe, using  **the partner's own Stripe merchant account** — funds settle directly to the partner, and no Eskimo branding appears on the checkout page, bank statement, or receipt. *(corrected — original just said "through Stripe and other supported payment methods" without saying whose account)*  
- **Email collection** – Customers enter their email during checkout. One email is associated with one eSIM, while multiple data plans can be added to the same eSIM.  
- **eSIM delivery** – After successful payment, the eSIM QR code and installation instructions are automatically sent to the customer by email.  
- **eSIM management** – Customers access a partner-branded portal through a secure email link or email/password login.  
- **Usage tracking** – Customers can view remaining data, active plans, expiry dates, and eSIM details.  
- **Additional purchases** – Customers can purchase additional data plans and add them to the same eSIM.  
- **Transactional emails** – Order confirmation, QR delivery, and other service emails can be sent using the partner's branding and email domain.  
**Partner Responsibility**  
The partner provides:  
- **Branding** – Logo, brand colors, display name, and customer support details.  
- **Payment processing** – The partner sets up and maintains its own Stripe merchant account (or equivalent payment gateway). Eskimo configures the white-label checkout to run on this account; funds go directly to the partner, and the partner bears standard payment-processing fees (typically ~3–4% + a small fixed fee per transaction, Stripe's own rates). *(new — this line was missing in the original doc)*  
- **Website domain** – A subdomain such as esim.partner.com. Eskimo provides the DNS record required to connect it to the white-label platform.  
- **Email domain** – A sending subdomain such as notify.partner.com. Eskimo provides the SendGrid DNS records required to authorize transactional emails under the partner's domain.  
- **DNS setup** – The partner's IT team adds the provided website and email DNS records.  
- **Partner portal** – The partner can monitor customers, eSIMs, purchases, and transaction history through the Eskimo partner portal.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OUQmAABBAsSdYxKYXx1gmEBOIFfwTYUuwZWa2ag8AgL841uquzq8nAAC8dj05WgYLQTzjnAAAAABJRU5ErkJggg==)  
