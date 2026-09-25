import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReview, setShowReview] = useState(false);

  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [showDispute, setShowDispute] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data.order;
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      // Determine who we are reviewing
      const revieweeId = user?.role === 'BUYER' ? order.farmer.userId : order.buyer.userId;
      const res = await apiClient.post('/reviews', {
        orderId: order.id,
        revieweeId,
        rating,
        comment
      });
      return res.data;
    },
    onSuccess: () => {
      alert('Review submitted!');
      setShowReview(false);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    }
  });

  const raiseDispute = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/disputes', {
        orderId: order.id,
        reason: disputeReason,
        description: disputeDesc
      });
      return res.data;
    },
    onSuccess: () => {
      alert('Dispute raised successfully. Admin will review shortly.');
      setShowDispute(false);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    }
  });

  if (isLoading) return <div style={{ padding: '24px' }}>Loading...</div>;
  if (error || !order) return <div style={{ padding: '24px', color: 'red' }}>Error loading order details.</div>;

  return (
    <div className="agri-container" style={{ paddingBottom: '24px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: '16px' }}>
        &larr; Back
      </button>

      <div className="agri-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Order #{order.id.slice(0, 8)}</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '12px', 
            fontWeight: 700,
            backgroundColor: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#D1FAE5' : (order.status === 'DISPUTED' ? '#FEE2E2' : '#FEF3C7'),
            color: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#065F46' : (order.status === 'DISPUTED' ? '#991B1B' : '#92400E')
          }}>
            {order.status}
          </span>
        </div>

        <hr style={{ borderTop: '1px solid #E5E7EB', margin: '16px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Farmer</h3>
            <p style={{ fontWeight: 600 }}>{order.farmer.fullName}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Buyer</h3>
            <p style={{ fontWeight: 600 }}>{order.buyer.businessName}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Produce</h3>
            <p style={{ fontWeight: 600 }}>{order.listing.quantity} {order.listing.unit} of {order.listing.cropType}</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '8px' }}>
              Total: ₹{order.totalAmount}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
        {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
          <button className="agri-btn agri-btn-primary" onClick={() => setShowReview(!showReview)}>
            {showReview ? 'Cancel Review' : 'Rate this Order'}
          </button>
        )}

        {order.status !== 'DISPUTED' && (
          <button className="agri-btn agri-btn-secondary" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none' }} onClick={() => setShowDispute(!showDispute)}>
            {showDispute ? 'Cancel Dispute' : 'Report an Issue (Dispute)'}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReview && (
        <div className="agri-card" style={{ marginTop: '16px' }}>
          <h3 style={{ marginTop: 0 }}>Leave a Review</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[1,2,3,4,5].map(star => (
              <button 
                key={star} 
                onClick={() => setRating(star)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: star <= rating ? '#F59E0B' : '#E5E7EB' }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea 
            className="agri-input" 
            placeholder="Share your experience..." 
            value={comment} 
            onChange={e => setComment(e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <button className="agri-btn agri-btn-primary" onClick={() => submitReview.mutate()} disabled={submitReview.isPending}>
            Submit Review
          </button>
        </div>
      )}

      {/* Dispute Form */}
      {showDispute && (
        <div className="agri-card" style={{ marginTop: '16px', border: '1px solid #FCA5A5' }}>
          <h3 style={{ marginTop: 0, color: '#991B1B' }}>Raise a Dispute</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>If there was a problem with quality, payment, or delivery, let us know.</p>
          
          <select 
            className="agri-input" 
            value={disputeReason} 
            onChange={e => setDisputeReason(e.target.value)}
            style={{ marginBottom: '12px' }}
          >
            <option value="">Select reason...</option>
            <option value="QUALITY_ISSUE">Poor Quality / Spoiled Produce</option>
            <option value="QUANTITY_MISMATCH">Quantity mismatch</option>
            <option value="DELIVERY_DELAY">Severe Delivery Delay</option>
            <option value="PAYMENT_ISSUE">Payment Issue</option>
            <option value="OTHER">Other</option>
          </select>

          <textarea 
            className="agri-input" 
            placeholder="Describe the problem in detail..." 
            value={disputeDesc} 
            onChange={e => setDisputeDesc(e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <button className="agri-btn agri-btn-primary" style={{ backgroundColor: '#DC2626' }} onClick={() => raiseDispute.mutate()} disabled={raiseDispute.isPending || !disputeReason}>
            Submit Dispute
          </button>
        </div>
      )}
    </div>
  );
}
