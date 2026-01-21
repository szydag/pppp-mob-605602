import React, { useState, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

// --- Configuration Constants ---
export const COLORS = {
  accent: "#10B981",
  primary: "#059669",
  secondary: "#ECFDF5",
  background: "#F0FDF4",
  text: "#1F2937",
  lightText: "#FFFFFF",
  gray: "#D1D5DB",
  darkGray: "#6B7280",
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: 'Düşük' | 'Normal' | 'Yüksek';
  isCompleted: boolean;
};

const initialTasks: Task[] = [
  { id: '1', title: 'Proje Raporunu Tamamla', description: 'Haftalık proje raporunu düzenleyip yöneticiye e-posta ile gönder.', dueDate: '2024-12-18', priority: 'Yüksek', isCompleted: false },
  { id: '2', title: 'Müşteri Toplantısı Hazırlığı', description: 'Sunum slaytlarını gözden geçir.', dueDate: '2024-12-19', priority: 'Normal', isCompleted: true },
  { id: '3', title: 'E-postaları Kontrol Et', description: 'Gelen kutusunu temizle.', dueDate: null, priority: 'Düşük', isCompleted: false },
  { id: '4', title: 'Yeni Özellik Tasarımı', description: 'Figma tasarımlarını incele.', dueDate: '2024-12-25', priority: 'Yüksek', isCompleted: false },
  { id: '5', title: 'Ödeme Yap', description: 'Faturaları öde.', dueDate: '2024-12-30', priority: 'Düşük', isCompleted: false },
];

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  toggleTaskCompletion: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  deleteTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString(), // Simple unique ID generation
      isCompleted: false,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };
  
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  const getTaskById = (id: string) => tasks.find(task => task.id === id);


  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTaskCompletion, getTaskById, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <AppNavigator />
      <StatusBar style="light" backgroundColor={COLORS.primary} />
    </TaskProvider>
  );
}