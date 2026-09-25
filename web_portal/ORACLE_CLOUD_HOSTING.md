# ☁️ Hosting HM-Nexora on Oracle Cloud (Always Free Tier)

Yes, you can **absolutely** host HM-Nexora on the **Oracle Cloud Infrastructure (OCI) Always Free Tier**! 

In fact, Oracle offers the most generous free tier in the cloud industry today, giving you plenty of power to run Next.js in production without paying a single cent.

This guide will walk you through how to set it up from scratch.

---

## 🎛️ Why Oracle Cloud Free Tier is Perfect for Next.js

Unlike other cloud providers who give you tiny 512MB VMs, Oracle's **Always Free Tier** includes:
* **Ampere A1 Flex instances:** Up to **4 OCPUs** and **24 GB RAM** (which you can split into up to 4 separate virtual machines, or use as one massive 4-CPU / 24GB-RAM server).
* **Storage:** **200 GB** of free NVMe Block Storage.
* **Network:** **10 TB** of free outbound data transfer per month.

---

## 🗺️ Step 1: Provisioning the OCI VM Instance

1. Sign up/Log in to the **Oracle Cloud Console**.
2. Navigate to **Compute** > **Instances** > Click **Create Instance**.
3. **Placement & Image:**
   * **Operating System:** Click *Change Image* and select **Ubuntu 22.04 Minimal** or **Ubuntu 22.04 LTS** (Ubuntu is highly recommended for compatibility).
   * **Shape:** Click *Change Shape* and choose **Ampere (ARM-based)**. Select `VM.Standard.A1.Flex`.
   * **Resources:** Assign **2 OCPUs** and **12 GB RAM** (this leaves you resources to spin up another server later if you want, and easily prevents Next.js memory crashes during production build).
4. **Networking:**
   * Leave default VCN and Subnet selected.
   * Make sure **Assign a public IPv4 address** is set to **Yes**.
5. **Add SSH Keys:**
   * Select **Generate a key pair for me** and **Download Private Key** (`.key` file). Keep this safe! You need it to connect.
6. **Boot Volume:**
   * Leave default size or change it to `50 GB` (you have up to 200 GB total free storage).
7. Click **Create** and wait 1–2 minutes for the status to show **Running**. Copy the **Public IP Address**.

---

## 🔒 Step 2: Open OCI Network Ports (VCN Ingress Rules)

By default, Oracle blocks all external web ports. We must open them in the cloud console:

1. In the instance details screen, under **Instance Information**, click on your **Virtual Cloud Network (VCN)** link.
2. Click on **Subnets** > Click on your **Public Subnet**.
3. Click on the **Default Security List** for your subnet.
4. Under **Ingress Rules**, click **Add Ingress Rules** and create these rules:

#### Rule 1: Allow HTTP Traffic
* **Source Type:** CIDR
* **Source CIDR:** `0.0.0.0/0`
* **IP Protocol:** `TCP`
* **Source Port Range:** (Leave blank)
* **Destination Port Range:** `80`
* **Description:** Allow HTTP Web Traffic

#### Rule 2: Allow HTTPS Traffic
* **Source Type:** CIDR
* **Source CIDR:** `0.0.0.0/0`
* **IP Protocol:** `TCP`
* **Source Port Range:** (Leave blank)
* **Destination Port Range:** `443`
* **Description:** Allow HTTPS Secure Traffic

---

## 🖥️ Step 3: Connect and Bypass the OS Firewall (Critical!)

> [!CAUTION]
> **This is where 90% of developers get stuck.** 
> Ubuntu images on Oracle Cloud come with a built-in local OS firewall (`iptables`) that blocks ports `80` and `443`, *even after* you opened them in the OCI web console. You must manually clear them in the shell.

1. Open your terminal (e.g., PowerShell on Windows or Git Bash) and connect to your instance:
   ```bash
   ssh -i /path/to/your/private_key.key ubuntu@<YOUR_VM_PUBLIC_IP>
   ```
2. Update packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. Run the following commands to bypass the internal OS firewall and save the rules:
   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

---

## 📦 Step 4: Install Node.js & PM2 on the VM

Next.js requires Node.js. Let's install the latest stable Node.js and PM2 (a production process manager to keep your app running forever).

1. Install Node.js (v20 LTS):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Verify installation:
   ```bash
   node -v
   npm -v
   ```
3. Install **PM2** globally:
   ```bash
   sudo npm install -g pm2
   ```

---

## 🚀 Step 5: Clone & Build HM-Nexora

1. Clone your git repository onto the server:
   ```bash
   git clone <your-github-repo-url> hm-nexora
   cd hm-nexora
   ```
2. Install dependencies:
   ```bash
   npm install --production=false
   ```
3. Create your production environment file:
   ```bash
   nano .env.local
   ```
   *Paste your Supabase, Gemini, Firebase, and Email keys here. Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit.*
4. Build the Next.js production bundle:
   ```bash
   npm run build
   ```
5. Launch Next.js using PM2 so it stays active in the background:
   ```bash
   pm2 start "npm run start" --name "hm-nexora"
   ```
6. Configure PM2 to auto-start if the VM ever reboots:
   ```bash
   pm2 startup
   ```
   *(Copy and paste the command output by the terminal to finalize startup registration).*
   ```bash
   pm2 save
   ```

---

## 🔀 Step 6: Set Up Nginx Reverse Proxy & SSL

Currently, Next.js is running locally on port `3000`. We want visitors to access it directly on standard ports (`80` / `443`) and secure it with SSL. We will use **Nginx** as a reverse proxy.

1. Install Nginx:
   ```bash
   sudo apt install nginx -y
   ```
2. Edit Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
3. Replace the contents of the file with this clean reverse proxy configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   *(Replace `your-domain.com` with your actual domain name. If you don't have a domain yet, use your VM Public IP for testing).*
4. Test and restart Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 🔒 Add a Free SSL Certificate (Let's Encrypt)
Secure your web application with free HTTPS:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```
*Follow the on-screen prompts to automatically fetch and configure your SSL certificates. Certbot will configure auto-renewal automatically!*

---

## 🎉 Done!
Your **HM-Nexora** app is now hosted, secured, and running live on **Oracle Cloud Always Free Tier** 24/7/365!
