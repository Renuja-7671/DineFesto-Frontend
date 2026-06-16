import { api } from '../lib/api';

export const getChatbotStatus = async () => {
  const response = await api.get('/chatbot/status');
  return response.data.data;
};

export const sendChatMessage = async (message, history = []) => {
  const response = await api.post('/chatbot/message', { message, history }, { timeout: 60000 });
  return response.data.data;
};
