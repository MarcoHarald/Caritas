import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface LendingItem {
  id: string;
  itemName: string;
  organization: string;
  dateLent: string;
  dateReturned: string | null;
  notes: string;
}

const Lending: React.FC = () => {
  const [items, setItems] = useState<LendingItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<LendingItem, 'id'>>({
    itemName: '',
    organization: '',
    dateLent: new Date().toISOString().split('T')[0],
    dateReturned: null,
    notes: '',
  });
  const [filter, setFilter] = useState<'all' | 'lent' | 'returned'>('all');
  const [editingItem, setEditingItem] = useState<LendingItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const q = query(collection(db, 'lendingItems'), orderBy('dateLent', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedItems: LendingItem[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LendingItem));
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
    await addDoc(collection(db, 'lendingItems'), newItem);
    setNewItem({
      itemName: '',
      organization: '',
      dateLent: new Date().toISOString().split('T')[0],
      dateReturned: null,
      notes: '',
    });
    fetchItems();
  };

  const handleEditItem = (item: LendingItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      const itemRef = doc(db, 'lendingItems', editingItem.id);
      await updateDoc(itemRef, {
        itemName: editingItem.itemName,
        organization: editingItem.organization,
        dateLent: editingItem.dateLent,
        dateReturned: editingItem.dateReturned,
        notes: editingItem.notes,
      });
      setEditingItem(null);
      fetchItems();
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleReturnItem = async (id: string) => {
    const itemRef = doc(db, 'lendingItems', id);
    await updateDoc(itemRef, {
      dateReturned: new Date().toISOString().split('T')[0],
    });
    fetchItems();
  };

  const handleUndoReturn = async (id: string) => {
    const itemRef = doc(db, 'lendingItems', id);
    await updateDoc(itemRef, {
      dateReturned: null,
    });
    fetchItems();
  };

  const filteredItems = items.filter(item => {
    if (filter === 'lent') return item.dateReturned === null;
    if (filter === 'returned') return item.dateReturned !== null;
    return true;
  });

  return (
    <div className="lending-page">
      <h1 className="text-2xl font-bold mb-4">Lending Tracker</h1>
      
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
              name="dateLent"
              value={newItem.dateLent}
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
          Add Lending Item
        </button>
      </form>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lending Items</h2>
        <div>
          <label className="mr-2">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'lent' | 'returned')}
            className="p-2 border rounded"
          >
            <option value="all">All</option>
            <option value="lent">Currently Lent</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Item Name</th>
            <th className="text-left">Organization</th>
            <th className="text-left">Date Lent</th>
            <th className="text-left">Date Returned</th>
            <th className="text-left">Notes</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
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
                      name="dateLent"
                      value={editingItem.dateLent}
                      onChange={handleEditInputChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="dateReturned"
                      value={editingItem.dateReturned || ''}
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
                    <button onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 px-2 py-1 rounded">
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.itemName}</td>
                  <td>{item.organization}</td>
                  <td>{item.dateLent}</td>
                  <td>{item.dateReturned || 'Not returned'}</td>
                  <td>{item.notes}</td>
                  <td>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    {!item.dateReturned ? (
                      <button
                        onClick={() => handleReturnItem(item.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Mark as Returned
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUndoReturn(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Undo Return
                      </button>
                    )}
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

export default Lending;