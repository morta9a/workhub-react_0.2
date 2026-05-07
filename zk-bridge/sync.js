require('dotenv').config();
const ZKLib = require('node-zklib');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const ZK_IP = process.env.ZK_IP || '192.168.1.201'; // Default IP of biometric device
const ZK_PORT = parseInt(process.env.ZK_PORT || '4370');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // service_role key is recommended for backend scripts

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERROR: Missing SUPABASE_URL or SUPABASE_KEY in .env file.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const zkInstance = new ZKLib({
  ip: ZK_IP,
  port: ZK_PORT,
  inport: 5200,
  timeout: 10000,
});

async function syncAttendance() {
  console.log(`⏳ Connecting to ZKTeco device at ${ZK_IP}:${ZK_PORT}...`);
  try {
    // Create socket to machine
    await zkInstance.createSocket();
    
    // Get general info like serial number
    console.log("✅ Connected. Getting machine info...");
    const sn = await zkInstance.getSerialNumber();
    console.log(`Device Serial Number: ${sn}`);

    // Get users map (UID to User details)
    console.log("👥 Fetching users...");
    const usersResponse = await zkInstance.getUsers();
    const users = usersResponse.data || [];
    const usersMap = {};
    users.forEach(user => {
      usersMap[user.uid] = user.name || `User ${user.userId}`;
    });
    console.log(`Found ${users.length} users.`);

    // Get attendance records
    console.log("📝 Fetching attendance logs...");
    const attendancesResponse = await zkInstance.getAttendances();
    const logs = attendancesResponse.data || [];
    console.log(`Fetched ${logs.length} total logs.`);

    // Note: In a real production scenario, you'd track the last synced record 
    // to avoid sending the whole history every time. For this demo, we'll process the latest.
    
    // Format logs for Supabase
    const formattedLogs = logs.map(log => {
      return {
        uid: log.userSn,
        employee_name: usersMap[log.deviceUserId] || `User ${log.deviceUserId}`,
        timestamp: new Date(log.recordTime).toISOString(),
        // ZKTeco usually provides state: 0 (Check-In), 1 (Check-Out), etc.
        status: log.recordTime ? 'present' : 'absent' 
      };
    });

    if (formattedLogs.length === 0) {
      console.log("No new logs to sync.");
    } else {
      console.log(`☁️ Syncing ${formattedLogs.length} logs to Supabase...`);
      // Upsert logs (assuming we use uid + timestamp as unique composite key in DB, or just insert)
      const { data, error } = await supabase
        .from('attendance_logs')
        .insert(formattedLogs); // Modify if upsert is needed
        
      if (error) {
        console.error("❌ Supabase Insert Error:", error.message);
      } else {
        console.log("✅ Successfully synced to Supabase!");
      }
    }

  } catch (err) {
    console.error("❌ Connection or Fetch Error:", err);
  } finally {
    try {
      await zkInstance.disconnect();
      console.log("🔌 Disconnected from device.");
    } catch (e) {}
  }
}

// Run the sync function
syncAttendance();
