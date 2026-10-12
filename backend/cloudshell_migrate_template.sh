#!/bin/bash
# ==============================================================================
# DreamNexa — Cloud Shell Migration Script
# ==============================================================================
# INSTRUCTIONS:
# 1. Open Google Cloud Console → Activate Cloud Shell (top right ☁️ icon)
# 2. Run this command to find your Cloud SQL instance name:
#       gcloud sql instances list
# 3. Set the variables below
# 4. Paste this entire script into Cloud Shell and press Enter
# ==============================================================================

# ─── EDIT THESE ───────────────────────────────────────────────────────────────
INSTANCE_NAME="your-cloud-sql-instance-name"   # from: gcloud sql instances list
DB_NAME="dreamnexa"                             # your database name
DB_USER="root"                                  # your Cloud SQL user
# ──────────────────────────────────────────────────────────────────────────────

echo "🔍 Checking Cloud SQL instance..."
gcloud sql instances describe "$INSTANCE_NAME" --format="value(name,state,backendType)" 2>/dev/null || {
  echo "❌ Could not find instance '$INSTANCE_NAME'"
  echo "   Run: gcloud sql instances list"
  echo "   Then update INSTANCE_NAME above"
  exit 1
}

echo ""
echo "📥 Downloading your exported data from GitHub..."
# You need to commit exported_data.sql to your repo first, OR paste inline below

# Option 1: If you pushed exported_data.sql to GitHub
# curl -sL "https://raw.githubusercontent.com/MrGangadhar/Dreamnexa/main/backend/exported_data.sql" -o /tmp/dreamnexa_data.sql

# Option 2: Create the SQL inline (paste your exported_data.sql content here)
cat > /tmp/dreamnexa_data.sql << 'ENDSQL'
PASTE_YOUR_EXPORTED_SQL_HERE
ENDSQL

echo "📊 Importing data to Cloud SQL: $INSTANCE_NAME / $DB_NAME"
gcloud sql connect "$INSTANCE_NAME" --user="$DB_USER" --database="$DB_NAME" < /tmp/dreamnexa_data.sql

echo ""
echo "✅ Import complete! Verifying row counts..."
gcloud sql connect "$INSTANCE_NAME" --user="$DB_USER" --database="$DB_NAME" << 'EOF'
SELECT 'current_affairs' as tbl, COUNT(*) as rows FROM current_affairs
UNION ALL
SELECT 'govt_jobs', COUNT(*) FROM govt_jobs
UNION ALL
SELECT 'news_articles', COUNT(*) FROM news_articles;
EOF
