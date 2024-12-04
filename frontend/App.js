// App.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';

const App = () => {
  const [todos, setTodos] = useState([]); // State to store the list of to-dos
  const [newTodo, setNewTodo] = useState(''); // State for new to-do input

  // Function to fetch the to-do list from the backend
  const fetchTodoList = () => {
    fetch('http://localhost:3001/get-todo') // Make sure to use the correct IP address if testing on a device
      .then(response => response.json())
      .then(data => setTodos(data)) // Set the todos in state
      .catch(error => console.error('Error fetching to-do list:', error));
  };

  // Poll the server every 5 seconds to fetch the latest to-do list
  useEffect(() => {
    const interval = setInterval(fetchTodoList, 5000); // Poll every 5 seconds

    // Initial fetch when the page loads
    fetchTodoList();

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Function to add a new to-do item
  const addTodo = () => {
    const task = newTodo.trim();
    if (task) {
      fetch('http://localhost:3001/add-todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task }),
      })
        .then(response => response.json())
        .then(newTodo => {
          console.log('New to-do added:', newTodo);
          fetchTodoList(); // Refresh the list after adding a new item
          setNewTodo(''); // Clear input field
        })
        .catch(error => console.error('Error adding todo:', error));
    }
  };

  // Function to render each to-do item in the FlatList
  const renderItem = ({ item }) => {
    return (
      <View style={styles.todoItem}>
        <Text style={item.completed ? styles.completed : null}>{item.task}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={newTodo}
        onChangeText={setNewTodo}
        placeholder="Add a new to-do"
      />
      <Button title="Add To-Do" onPress={addTodo} />
      <FlatList
        data={todos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  list: {
    marginTop: 20,
  },
  todoItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});

export default App;
