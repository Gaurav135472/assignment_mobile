import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

const API_URL = "/api";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");

  // Fetch Todos
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/get-todo`);
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load todos");
    } finally {
      setLoading(false);
    }
  };

  // Add Todo
  const addTodo = async () => {
    if (!newTask.trim()) {
      Alert.alert("Error", "Task cannot be empty");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add-todo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }

      const newTodo = await response.json();
      setTodos((prev) => [...prev, newTodo]);
      setNewTask(""); // Clear input field
    } catch (err) {
      Alert.alert("Error", "Failed to add task");
    }
  };

  // Delete Todo
  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/delete-todo/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      Alert.alert("Error", "Failed to delete task");
    }
  };

  // Clear All Todos
  const clearTodos = async () => {
    try {
      await fetch(`${API_URL}/clear-todos`, { method: "DELETE" });
      setTodos([]);
    } catch (err) {
      Alert.alert("Error", "Failed to clear todos");
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <Text style={item.completed ? styles.completed : styles.task}>
                {item.task}
              </Text>
              <TouchableOpacity onPress={() => deleteTodo(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button title="Add" onPress={addTodo} />
      </View>

      <Button title="Clear All" onPress={clearTodos} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  todoItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  task: { flex: 1, fontSize: 16 },
  completed: { flex: 1, fontSize: 16, textDecorationLine: "line-through", color: "gray" },
  deleteButton: { color: "red", marginHorizontal: 10 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 10, marginRight: 10, borderRadius: 5 },
});

export default App;
