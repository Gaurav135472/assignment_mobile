import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native';

// Backend API URL
const API_URL = 'http://localhost:3001'; // Replace 'localhost' with your machine's IP if testing on a physical device

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');

  // Fetch the to-do list from the backend
  const fetchTodoList = async () => {
    try {
      const response = await fetch(`${API_URL}/get-todo`);
      if (!response.ok) {
        throw new Error('Failed to fetch to-do list');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError('Error fetching to-do list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new to-do item
  const addTodo = async () => {
    if (!newTask.trim()) return;

    try {
      const response = await fetch(`${API_URL}/add-todo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask }),
      });
      if (!response.ok) {
        throw new Error('Failed to add to-do item');
      }
      const addedTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, addedTodo]);
      setNewTask('');
    } catch (err) {
      setError('Error adding to-do item');
      console.error(err);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchTodoList();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <Text>
                {item.task} {item.completed ? '(Completed)' : '(Pending)'}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.addTodoContainer}>
        <TextInput
          style={styles.input}
          placeholder="New task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button title="Add" onPress={addTodo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  todoItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addTodoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
});

export default App;
