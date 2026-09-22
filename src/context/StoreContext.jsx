import React,{createContext,useContext,useEffect,useState}from'react';
import api from'../api';
const C=createContext();
export function StoreProvider({children}){
  const[user,setUser]=useState(null);
  const[cart,setCart]=useState([]);
  useEffect(()=>{
    try{
      setUser(JSON.parse(localStorage.getItem('tw_user')||'null'));
      setCart(JSON.parse(localStorage.getItem('tw_cart')||'[]'));
    }catch{}
  },[]);
  const login=d=>{localStorage.setItem('tw_token',d.token);localStorage.setItem('tw_user',JSON.stringify(d.user));setUser(d.user)};
  const logout=()=>{localStorage.removeItem('tw_token');localStorage.removeItem('tw_user');setUser(null)};
  useEffect(()=>{if(typeof window!=='undefined')localStorage.setItem('tw_cart',JSON.stringify(cart))},[cart]);
  const add=p=>setCart(c=>{const x=c.find(i=>i.product===p._id);return x?c.map(i=>i.product===p._id?{...i,qty:Math.min(i.qty+1,p.stock)}:i):[...c,{product:p._id,name:p.name,price:p.price,image:p.image,qty:1}]});
  return <C.Provider value={{user,login,logout,cart,setCart,add,api}}>{children}</C.Provider>
}
export const useStore=()=>useContext(C);
