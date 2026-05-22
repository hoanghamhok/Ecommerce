const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5091';


import axios from 'axios';

const API = axios.create({
  baseURL: `${API_BASE}/api`
})

//API láº¥y danh sÃ¡ch nhÃ³m sáº£n pháº©m
export const fetchCategories = () => API.get('/categories');

//API táº¡o má»›i nhÃ³m sáº£n pháº©m
export const createCategory = (
  data: {name: string, description: string}) => API.post(
    '/categories', data);

//API sá»­a nhÃ³m sáº£n pháº©m
export const updateCategory = (id: number, 
  data : {name: string, description: string}) => API.put(
    `/categories/${id}`, data);

//API xÃ³a nhÃ³m sáº£n pháº©m
export const deleteCategory = (id: number) => API.delete(
  `/categories/${id}`);




// PRODUCT API
export const fetchProducts = () => API.get("/products", {
  headers: {
    'Content-Type': 'application/json',  // Äáº£m báº£o gá»­i header há»£p lá»‡
  },});
export const createProduct = (data: any) =>

                  API.post("/products", data);
export const updateProduct = (id: number, data: any) => 
                  API.put(`/products/${id}`, data);
export const deleteProduct = (id: number) => 
                  API.delete(`/products/${id}`);


// Upload image
export const uploadImage = (formData: FormData) => {
  return API.post('/files/upload', formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

//Xá»­ lÃ½ Ä‘Äƒng nháº­p
export const login = (username: string, password: string) => {
  return API.post("/auth/login", {username, password});
}

//Xá»­ lÃ½ giá» hÃ ng
//ThÃªm sáº£n pháº©m vÃ o giá»
export const addToCart = (data: {productId: number, quantity: number}) => {
  return API.post("/cart/add", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

//Láº¥y danh sÃ¡ch sáº£n pháº©m trong giá»
export const fetchCart = () => {
  return API.get("/cart/get", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

//Cáº­p nháº­t sá»‘ lÆ°á»£ng sáº£n pháº©m trong giá»
export const updateCartItem = (productId: number, quantity: number) => {
  return API.put('/cart/update-quantity', {productId: productId, quantity}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}
//XÃ³a sáº£n pháº©m khá»i giá»
export const removeCartItem = (productId: number) => {
  return API.delete(`/cart/remove/${productId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}
//API ngÆ°á»i dÃ¹ng
export const fetchUsers = () => API.get("/users", {
  headers: {
    'Content-Type': 'application/json',  
  },});
export const createUser = (data: any) =>
                  API.post("/users", data);



// Láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng
export const fetchOrders = () =>
  API.get("/order/admin", {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
//Chatbot Advisor
  export async function fetchChatbotAnswer(question: string) {
  try {
    const res = await fetch(`${API_BASE}/api/chatbotadvisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.answer) {
      throw new Error("API response did not contain an 'answer'.");
    }
    
    return data.answer;
  } catch (error) {
    console.error("Failed to fetch chatbot answer:", error);
    // Re-throw the error to be caught by handleSendMessage
    throw error;
  }
}
export default API;
