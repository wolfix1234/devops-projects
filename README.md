# مهندس دواپس و باگ بانتی هانتر

## درباره من  
مهندس DevOps با تجربه در طراحی، پیاده‌سازی و مدیریت زیرساخت‌های مبتنی بر IaC، کانتینرسازی، Kubernetes و امنیت زیرساخت.  
پروژه شاخص من، پلتفرم تولید سایت (https://tomakdigitalagency.ir) است که در آن به تنهایی تمام زنجیره‌ی DevOps، CI/CD، IaC، امنیت و بخشی از Backend را مدیریت کردم.  
این سیستم قادر است در کمتر از ۱ دقیقه یک سایت جدید ایجاد کند و در آینده با هوش مصنوعی و «تک پرامپت» تکمیل خواهد شد.  

به‌صورت هم‌زمان در حوزه امنیت و باگ‌بانتی نیز فعالیت دارم و ابزارهای امنیتی اختصاصی با Python توسعه می‌دهم.

---

## پروژه‌های شاخص  

### **پلتفرم Site-Builder (https://tomakdigitalagency.ir)**  
- **لینک‌ها:**
  - سایت اصلی: https://tomakdigitalagency.ir  
  - داشبورد ادمین: https://dashboard.tomakdigitalagency.ir  
  - سرویس ساخت سایت: https://complex.tomakdigitalagency.ir  
  - دامنه کاربر: https://storeid.tomakdigitalagency.ir (زیردامنه خودکار – فاز بعد: دامنه اختصاصی)  
- **ساختار پروژه:** 6 مخزن (landing، dashboard، core، user-website، payment، iac)  
- هر سرویس دارای CI/CD مستقل و استقرار اتوماتیک با Terraform روی ArvanCloud Kubernetes در سه محیط:
  - Development / Staging / Production  
- مدیریت Secrets با HashiCorp Vault  
- ۹۰٪ پروژه آماده و فاز نهایی تا سه هفته آینده تکمیل می‌شود.  
- **نقش من:** طراحی کل DevOps، IaC، CI/CD، امنیت، بخشی از Backend  

---

### **پروژه املاک (https://oujamlak.ir)**  
- سایت + چت سرویس جداگانه  
- استقرار روی VPS با CI/CD ساده (Bash Script) و پشت CDN کلودفلر  
- ریپوها:
  - https://github.com/wolfix1234/amlak-site  
  - https://github.com/wolfix1234/chat-app  
- **فلو:**  
```
push github => terriger workflow github => login to vps => run deploy.sh => deploy (docker + ngnix)
```
---

### **پروژه Python – ابزار امنیت و DevOps**
**Asset Discovery (FastAPI)**  
ریپو: https://github.com/wolfix1234/asset-discovery  
ابزاری برای کشف دارایی‌ها (Asset Discovery) در فرآیند باگ‌بانتی با FastAPI و چند Thread برای سرعت بالا.

**FastAPI Disk – NFS برای سایت‌ساز**  
ریپو: https://github.com/wolfix1234/fastapi-disk  
سرویس اختصاصی برای ذخیره‌ی JSON و تصاویر کاربران سایت‌ساز در Volumeهای NFS.  

---

## مهارت‌ها  
Docker · Kubernetes · Terraform · GitHub Actions · **GitLab CI/CD** · Vault · ArvanCloud · AWS · Prometheus · Grafana · Redis · MongoDB · Next.js · Node.js · Python · **FastAPI / Flask** · OWASP · امنیت وب · Bash · Linux  

---

## سوابق کاری  
- مهندس DevOps و Backend Developer – استارت‌آپ سایت‌ساز – شهریور ۱۴۰۳ تا کنون  
- فریلنسر باگ‌بانتی – شهریور ۱۴۰۲ تا کنون  

---

## تحصیلات  
دیپلم تجربی  

---

## اطلاعات تماس  
📧 ایمیل: wolfix007.xiflow@gmail.com  

---

## هدف کاری  
به دنبال تیمی هستم که با هم رشد کنیم — من صرفاً دنبال انجام چند پروژه نیستم،  
می‌خواهم در تیمی باشم که بتوانم هم کمک کنم، هم یاد بگیرم و زیرساخت را به سطح حرفه‌ای‌تری برسانم.  
مشتاق گفت‌وگو برای مصاحبه حضوری یا آنلاین هستم.
