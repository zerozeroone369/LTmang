// Khung Realtime Socket.io dùng chung (Phụ trách chính: Thái - M09)
const userSockets = new Map();
let ioInstance = null;

function initSocket(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth && socket.handshake.auth.userId;
    if (userId) {
      userSockets.set(String(userId), socket.id);
    }
    socket.on('disconnect', () => {
      if (userId && userSockets.get(String(userId)) === socket.id) {
        userSockets.delete(String(userId));
      }
    });
  });
}

function sendNotification(userId, type, payload) {
  if (!ioInstance) return false;
  const sid = userSockets.get(String(userId));
  if (sid) {
    ioInstance.to(sid).emit(type, payload);
    return true;
  }
  return false;
}

module.exports = { initSocket, sendNotification };
