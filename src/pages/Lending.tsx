import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface LendingItem {
  id: string;
  itemName: string;
  borrower: string;
  dateBorrowed: string;
  dateReturned: string | null;
  notes: string;
}

const Lending: React.FC = () => {
  const [items, setItems] = useState<LendingItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<LendingItem, 'id'>>({
    itemName: '',
    borrower: '',
    dateBorrowed: new Date().toISOString().split('T')[0],
    dateReturned: null,
    notes: '',
  });
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'returned'>('all');
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const q = query(collection(db, 'lendingItems'), orderBy('dateBorrowed', 'desc'));
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'lendingItems'), newItem);
    setNewItem({
      itemName: '',
      borrower: '',
      dateBorrowed: new Date().toISOString().split('T')[0],
      dateReturned: null,
      notes: '',
    });
    fetchItems();
  };

  const handleReturnItem = async (id: string) => {
    const itemRef = doc(db, 'lendingItems', id);
    await updateDoc(itemRef, {
      dateReturned: new Date().toISOString().split('T')[0],
    });
    fetchItems();
  };

  const handleUnreturnItem = async (id: string) => {
    const itemRef = doc(db, 'lendingItems', id);
    await updateDoc(itemRef, {
      dateReturned: null,
    });
    fetchItems();
  };

  const handleEditNotes = (id: string, currentNotes: string) => {
    setEditingNotes(prev => ({ ...prev, [id]: currentNotes }));
  };

  const handleSaveNotes = async (id: string) => {
    const itemRef = doc(db, 'lendingItems', id);
    await updateDoc(itemRef, {
      notes: editingNotes[id],
    });
    setEditingNotes(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    fetchItems();
  };

  const filteredItems = items.filter(item => {
    if (filter === 'borrowed') return item.dateReturned === null;
    if (filter === 'returned') return item.dateReturned !== null;
    return true;
  });

  return (
    <div className="lending-page">
      <h1 className="text-2xl font-bold mb-4">Lending Tracker</h1>
      
      <form onSubmit={handleAddItem} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="itemName"
            value={newItem.itemName}
            onChange={handleInputChange}
            placeholder="Item Name"
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="borrower"
            value={newItem.borrower}
            onChange={handleInputChange}
            placeholder="Borrower"
            required
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="dateBorrowed"
            value={newItem.dateBorrowed}
            onChange={handleInputChange}
            required
            className="p-2 border rounded"
          />
          <textarea
            name="notes"
            value={newItem.notes}
            onChange={handleInputChange}
            placeholder="Notes"
            className="p-2 border rounded"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Add Item
        </button>
      </form>

      <div className="mb-4">
        <label className="mr-2">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'borrowed' | 'returned')}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Item Name</th>
            <th className="text-left">Borrower</th>
            <th className="text-left">Date Borrowed</th>
            <th className="text-left">Date Returned</th>
            <th className="text-left">Notes</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td>{item.itemName}</td>
              <td>{item.borrower}</td>
              <td>{item.dateBorrowed}</td>
              <td>{item.dateReturned || 'Not returned'}</td>
              <td>
                {editingNotes[item.id] !== undefined ? (
                  <textarea
                    value={editingNotes[item.id]}
                    onChange={(e) => setEditingNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                    className="p-1 border rounded w-full"
                  />
                ) : (
                  item.notes
                )}
              </td>
              <td>
                {!item.dateReturned ? (
                  <>
                    <button
                      onClick={() => handleReturnItem(item.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Mark as Returned
                    </button>
                    {editingNotes[item.id] !== undefined ? (
                      <button
                        onClick={() => handleSaveNotes(item.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Save Notes
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditNotes(item.id, item.notes)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Edit Notes
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleUnreturnItem(item.id)}
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm"
                    title="Undo return"
                  >
                    Undo Return
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Lending;