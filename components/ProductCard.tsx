
import React from 'react';
import { ProductData, EventType } from '../types';

interface ProductCardProps {
  product: ProductData;
  confidence?: number;
  onInteract: (productId: number, event: EventType) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, confidence, onInteract }) => {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      {confidence !== undefined && (
        <div className="absolute top-3 right-3 z-10 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
          {(confidence * 100).toFixed(0)}% Match
        </div>
      )}
      
      <div className="aspect-square bg-slate-100 overflow-hidden">
        <img 
          src={product.image_url || `https://picsum.photos/seed/${product.product_id}/400/400`} 
          alt={product.product_name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <div className="mb-1">
          <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-tighter">{product.category}</span>
        </div>
        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1" title={product.product_name}>
          {product.product_name}
        </h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.brand_name} - {product.description || 'No description available.'}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-black text-slate-900">₹{product.price}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onInteract(product.product_id, EventType.VIEW)}
            className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <i className="far fa-eye"></i>
            <span>View</span>
          </button>
          <button 
            onClick={() => onInteract(product.product_id, EventType.CART)}
            className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Cart</span>
          </button>
          <button 
            onClick={() => onInteract(product.product_id, EventType.PURCHASE)}
            className="col-span-2 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <i className="fas fa-wallet"></i>
            <span>Purchase Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};
