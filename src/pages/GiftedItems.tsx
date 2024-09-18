import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface GiftedItem {
  id: string;
  itemName: string;
  organization: string;
  dateGifted: string;
  notes: string;
}

const GiftedItems: React.FC = () => {
  const [items, setItems] = useState<GiftedItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<GiftedItem, 'id'>>({
    itemName: '',
    organization: '',
    dateGifted: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [editingItem, setEditingItem] = useState<GiftedItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const q = query(collection(db, 'giftedItems'), orderBy('dateGifted', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedItems: GiftedItem[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GiftedItem));
    setItems(fetchedItems);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingItem(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'giftedItems'), newItem);
    setNewItem({
      itemName: '',
      organization: '',
      dateGifted: new Date().toISOString().split('T')[0],
      notes: '',
    });
    fetchItems();
  };

  const handleEditItem = (item: GiftedItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      const itemRef = doc(db, 'giftedItems', editingItem.id);
      await updateDoc(itemRef, {
        itemName: editingItem.itemName,
        organization: editingItem.organization,
        dateGifted: editingItem.dateGifted,
        notes: editingItem.notes,
      });
      setEditingItem(null);
      fetchItems();
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'giftedItems', id));
      fetchItems();
    }
  };

  return (
    <div className="gifted-items-page">
      <h1 className="text-2xl font-bold mb-4">Gifted Items Tracker</h1>
      
      <form onSubmit={handleAddItem} className="mb-6 bg-gray-100 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="itemName"
              value={newItem.itemName}
              onChange={handleInputChange}
              placeholder="Item Name"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="text"
              name="organization"
              value={newItem.organization}
              onChange={handleInputChange}
              placeholder="Organization"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="date"
              name="dateGifted"
              value={newItem.dateGifted}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="text"
              name="notes"
              value={newItem.notes}
              onChange={handleInputChange}
              placeholder="Notes (optional)"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full">
          Add Gifted Item
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Gifted Items</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Item Name</th>
            <th className="text-left">Organization</th>
            <th className="text-left">Date Gifted</th>
            <th className="text-left">Notes</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {editingItem && editingItem.id === item.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="itemName"
                      value={editingItem.itemName}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="organization"
                      value={editingItem.organization}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="dateGifted"
                      value={editingItem.dateGifted}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="notes"
                      value={editingItem.notes}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <button onClick={handleSaveEdit} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                      Save
                    </button>
                    <button onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 px-2 py-1 rounded mr-2">
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)} 
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.itemName}</td>
                  <td>{item.organization}</td>
                  <td>{item.dateGifted}</td>
                  <td>{item.notes}</td>
                  <td>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GiftedItems;