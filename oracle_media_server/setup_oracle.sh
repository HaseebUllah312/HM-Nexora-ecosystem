#!/bin/bash
# =============================================================================
# HM NEXORA — 1-CLICK ORACLE CLOUD INSTALLER FOR MEDIA DOWNLOAD ENGINE
# Run on your Oracle Linux / Ubuntu VM: bash setup_oracle.sh
# =============================================================================

echo "=========================================="
echo "🚀 Setting up HM Nexora Media Stream Engine"
echo "=========================================="

# 1. Update system & install dependencies
sudo apt-get update -y || sudo yum update -y
sudo apt-get install -y python3 python3-pip python3-venv ffmpeg git curl || sudo yum install -y python3 python3-pip ffmpeg git curl

# 2. Setup Virtual Environment
cd "$(dirname "$0")"
python3 -m venv venv
source venv/bin/activate

# 3. Upgrade pip and install yt-dlp & FastAPI
pip install --upgrade pip
pip install -r requirements.txt

# 4. Open Firewall Port 8000 (Oracle Cloud iptables / ufw)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT || true
sudo ufw allow 8000/tcp || true

# 5. Create Systemd Service for 24/7 background operation
SERVICE_FILE=/etc/systemd/system/hmnexora-media.service
sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=HM Nexora Media Downloader Engine
After=network.target

[Service]
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload
sudo systemctl enable hmnexora-media
sudo systemctl restart hmnexora-media

echo "=========================================="
echo "✅ HM Nexora Media Engine is LIVE & RUNNING 24/7!"
echo "Server URL: http://$(curl -s ifconfig.me):8000"
echo "Health Check: http://$(curl -s ifconfig.me):8000/health"
echo "=========================================="
