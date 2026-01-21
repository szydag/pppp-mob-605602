import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, useTasks, Task } from '../../App';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = StackScreenProps<RootStackParamList, 'home'>;

// --- Components ---

// Header Component
const Header: React.FC<{ title: string }> = ({ title }) => (
    <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
        <Text style={styles.headerTitle}>{title}</Text>
    </View>
);

// FilterTabs Component
const FilterTabs: React.FC<{ tabs: string[], color: string, defaultActive: string, onChange: (tab: string) => void }> = ({ tabs, color, defaultActive, onChange }) => {
    const [activeTab, setActiveTab] = useState(defaultActive);

    const handlePress = (tab: string) => {
        setActiveTab(tab);
        onChange(tab);
    };

    return (
        <View style={styles.tabsContainer}>
            {tabs.map(tab => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        activeTab === tab && { borderBottomWidth: 3, borderBottomColor: color },
                    ]}
                    onPress={() => handlePress(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && { color: color, fontWeight: 'bold' }]}>
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// TaskListItem Component (Variant: Checkbox)
const TaskListItem: React.FC<{ task: Task, onPress: () => void, onToggle: () => void }> = ({ task, onPress, onToggle }) => (
    <TouchableOpacity style={styles.taskItem} onPress={onPress}>
        <TouchableOpacity onPress={onToggle} style={styles.checkboxArea}>
            <View style={[styles.checkbox, task.isCompleted && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}>
                {task.isCompleted && <Icon name="check" size={18} color={COLORS.lightText} />}
            </View>
        </TouchableOpacity>
        <View style={styles.taskContent}>
            <Text
                style={[
                    styles.taskTitle,
                    task.isCompleted && styles.completedText
                ]}
                numberOfLines={1}
            >
                {task.title}
            </Text>
            {task.dueDate && (
                 <Text style={[styles.taskDetail, task.isCompleted && styles.completedText]}>
                    Son Tarih: {task.dueDate}
                </Text>
            )}
        </View>
        <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]} />
    </TouchableOpacity>
);

const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
        case 'Yüksek': return '#EF4444'; // Red
        case 'Normal': return '#F59E0B'; // Amber
        case 'Düşük': return '#10B981'; // Accent (Green)
        default: return COLORS.gray;
    }
}

// FAB Component
const FloatingActionButton: React.FC<{ icon: string, color: string, action: () => void }> = ({ icon, color, action }) => (
    <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={action}>
        <Icon name={icon} size={24} color={COLORS.lightText} />
    </TouchableOpacity>
);

// --- Screen Logic ---

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { tasks, toggleTaskCompletion } = useTasks();
    const [filter, setFilter] = useState<'Tümü' | 'Aktif' | 'Tamamlandı'>('Aktif');

    const filteredTasks = useMemo(() => {
        if (filter === 'Aktif') {
            return tasks.filter(t => !t.isCompleted);
        }
        if (filter === 'Tamamlandı') {
            return tasks.filter(t => t.isCompleted);
        }
        return tasks; // Tümü
    }, [tasks, filter]);

    const handleItemClick = (taskId: string) => {
        navigation.navigate('detail', { taskId });
    };

    const EmptyListMessage = () => (
        <View style={styles.emptyContainer}>
            <Icon name="assignment" size={50} color={COLORS.darkGray} />
            <Text style={styles.emptyText}>Henüz görev yok. Yeni bir görev ekleyin!</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header title="Görevlerim" />
            
            <FilterTabs
                tabs={["Tümü", "Aktif", "Tamamlandı"]}
                color={COLORS.primary}
                defaultActive="Aktif"
                onChange={(tab) => setFilter(tab as 'Tümü' | 'Aktif' | 'Tamamlandı')}
            />

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 15 }}
                ListEmptyComponent={EmptyListMessage}
                renderItem={({ item }) => (
                    <TaskListItem 
                        task={item} 
                        onPress={() => handleItemClick(item.id)} 
                        onToggle={() => toggleTaskCompletion(item.id)}
                    />
                )}
            />

            <FloatingActionButton
                icon="add"
                color={COLORS.accent}
                action={() => navigation.navigate('add')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Header Styles
    header: {
        paddingTop: 50, 
        paddingHorizontal: 20,
        paddingBottom: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.lightText,
    },
    // Filter Tabs Styles
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.lightText,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    tabText: {
        fontSize: 16,
        color: COLORS.darkGray,
    },
    // Task List Styles
    taskItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightText,
        borderRadius: 8,
        padding: 15,
        marginVertical: 6,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    checkboxArea: {
        paddingRight: 15,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.gray,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskContent: {
        flex: 1,
        marginRight: 10,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
    },
    taskDetail: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: COLORS.darkGray,
    },
    priorityTag: {
        width: 6,
        height: '100%',
        borderRadius: 3,
        marginLeft: 'auto',
    },
    // FAB Styles
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: 'center',
    }
});

export default HomeScreen;