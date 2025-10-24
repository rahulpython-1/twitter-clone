import jwt from 'jsonwebtoken';

const userSockets = new Map(); // userId -> socketId mapping

export const initializeSocketIO = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);
    
    // Store user socket mapping
    userSockets.set(socket.userId, socket.id);
    
    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(`user:${data.recipientId}`).emit('user-typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    });

    // Handle stop typing
    socket.on('stop-typing', (data) => {
      socket.to(`user:${data.recipientId}`).emit('user-stop-typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      userSockets.delete(socket.userId);
    });
  });
};

export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToMultipleUsers = (io, userIds, event, data) => {
  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit(event, data);
  });
};

export { userSockets };
