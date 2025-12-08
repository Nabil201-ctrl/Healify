import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import { toggleChatBookmark } from '../../services/ChatService';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_URL = 'http://localhost:3000'; // Replace with your machine IP if testing on device

type Message = {
	id: string;
	author: 'me' | 'other' | 'doctor';
	text: string;
	timestamp: number;
	metadata?: {
		doctorId?: string;
		doctorName?: string;
	};
};

const Avatar = ({ uri }: { uri?: string }) => (
	<View
		style={{
			width: 36,
			height: 36,
			borderRadius: 18,
			overflow: 'hidden',
			backgroundColor: '#e5e7eb',
			borderWidth: 1,
			borderColor: '#f3f4f6'
		}}
	>
		{uri ? (
			<Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
		) : (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#06B6D4' }}>
				<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>AI</Text>
			</View>
		)}
	</View>
);

export default function ChatScreen() {
	const { isDark } = useTheme();
	const { user } = useAuthContext();
	const [mode, setMode] = useState<'doctor-chat' | 'certified-response'>('doctor-chat');
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const flatListRef = useRef<FlatList>(null);

	// Load History on Mount
	useEffect(() => {
		if (user) {
			loadHistory();
		}
	}, [user]);

	const loadHistory = async () => {
		try {
			const token = await AsyncStorage.getItem('accessToken');
			const userId = user?.id || "user_123";

			if (!token) {
				console.error("No access token found");
				return;
			}

			const response = await fetch(`${API_URL}/chat/history/${userId}`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (data.success && data.history) {
				const formattedMessages = data.history.map((m: any) => ({
					id: m.id,
					author: m.author === 'me' ? 'me' : 'other',
					text: m.text,
					timestamp: new Date(m.timestamp).getTime()
				}));
				setMessages(formattedMessages);
				setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
			}
		} catch (error) {
			console.error("Failed to load history:", error);
		}
	};

	const pollForResponse = async (sessionId: string) => {
		setIsTyping(true);
		const token = await AsyncStorage.getItem('accessToken');
		if (!token) {
			console.error("No access token found for polling");
			setIsTyping(false);
			return;
		}

		const pollInterval = setInterval(async () => {
			try {
				const response = await fetch(`${API_URL}/chat/session/${sessionId}`, {
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});
				const data = await response.json();

				if (data.success && data.session.status === 'completed') {
					clearInterval(pollInterval);
					setIsTyping(false);

					const reply: Message = {
						id: Math.random().toString(36).slice(2),
						author: 'other',
						text: data.session.response,
						timestamp: Date.now(),
					};
					setMessages(prev => [...prev, reply]);
					setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
				}
			} catch (error) {
				console.error("Polling error:", error);
				clearInterval(pollInterval);
				setIsTyping(false);
			}
		}, 1000);

		// Stop polling after 30 seconds
		setTimeout(() => {
			clearInterval(pollInterval);
			setIsTyping(false);
		}, 30000);
	};

	const sendMessage = async () => {
		const trimmed = input.trim();
		if (!trimmed) return;

		const msg: Message = {
			id: Math.random().toString(36).slice(2),
			author: 'me',
			text: trimmed,
			timestamp: Date.now(),
		};
		setMessages(prev => [...prev, msg]);
		setInput('');
		setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

		try {
			const token = await AsyncStorage.getItem('accessToken');
			if (!token) {
				console.error("No access token found");
				return;
			}

			const response = await fetch(`${API_URL}/chat/send`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					message: trimmed
				})
			});

			const data = await response.json();
			if (data.success) {
				setCurrentSessionId(data.sessionId);
				pollForResponse(data.sessionId);
			} else {
				console.error("Failed to send message:", data.message);
			}
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const handleBookmarkToggle = async () => {
		if (!currentSessionId) {
			console.warn('No active session to bookmark');
			return;
		}

		try {
			const newBookmarkState = !isBookmarked;
			await toggleChatBookmark(currentSessionId, newBookmarkState);
			setIsBookmarked(newBookmarkState);
			console.log(`Chat ${newBookmarkState ? 'bookmarked' : 'unbookmarked'}`);
		} catch (error) {
			console.error('Failed to toggle bookmark:', error);
		}
	};

	const MessageBubble = ({ item }: { item: Message }) => {
		const isMe = item.author === 'me';
		const isDoctor = item.author === 'doctor';

		return (
			<View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', marginVertical: 8 }}>
				{!isMe && (
					<View style={{
						width: 36,
						height: 36,
						borderRadius: 18,
						overflow: 'hidden',
						backgroundColor: isDoctor ? '#10b981' : '#06B6D4',
						borderWidth: 2,
						borderColor: isDoctor ? '#059669' : '#0891b2',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
						<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
							{isDoctor ? '👨‍⚕️' : 'AI'}
						</Text>
					</View>
				)}
				<View
					style={{
						backgroundColor: isMe
							? '#06B6D4'
							: isDoctor
								? '#10b981'
								: (isDark ? '#374151' : '#F3F4F6'),
						marginHorizontal: 8,
						paddingHorizontal: 16,
						paddingVertical: 12,
						borderRadius: 20,
						borderBottomRightRadius: isMe ? 4 : 20,
						borderBottomLeftRadius: isMe ? 20 : 4,
						maxWidth: '75%',
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 1 },
						shadowOpacity: 0.1,
						shadowRadius: 1,
						elevation: 1
					}}
				>
					{isDoctor && (
						<Text style={{
							fontSize: 10,
							color: '#fff',
							fontWeight: '600',
							marginBottom: 4,
							opacity: 0.9
						}}>
							{item.metadata?.doctorName || '👨‍⚕️ Doctor'}
						</Text>
					)}
					<Text style={{
						color: isMe || isDoctor ? '#fff' : (isDark ? '#fff' : '#1f2937'),
						fontSize: 15,
						lineHeight: 22
					}}>
						{item.text}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff' }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
		>
			{/* Chat header */}
			<View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#f3f4f6', backgroundColor: isDark ? '#1f2937' : '#fff' }}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Avatar />
					<View style={{ marginLeft: 12, flex: 1 }}>
						<Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#fff' : '#111827' }}>Healify Assistant</Text>
						<Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}>Always here for you</Text>
					</View>
					{/* Bookmark Button */}
					<TouchableOpacity
						onPress={handleBookmarkToggle}
						disabled={!currentSessionId}
						style={{
							padding: 8,
							borderRadius: 20,
							backgroundColor: isDark ? '#374151' : '#f3f4f6',
							opacity: currentSessionId ? 1 : 0.5,
						}}
					>
						<Text style={{ fontSize: 20 }}>{isBookmarked ? '⭐' : '☆'}</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Messages */}
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <MessageBubble item={item} />}
				contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 20 }}
				ListFooterComponent={isTyping ? (
					<View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 5 }}>
						<Avatar />
						<View style={{ marginLeft: 10, backgroundColor: isDark ? '#374151' : '#F3F4F6', padding: 10, borderRadius: 15, borderBottomLeftRadius: 4 }}>
							<Text style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 12 }}>Thinking...</Text>
						</View>
					</View>
				) : null}
				onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
			/>

			{/* Input Bar */}
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 16,
					paddingVertical: 12,
					borderTopWidth: 1,
					borderTopColor: isDark ? '#374151' : '#f3f4f6',
					backgroundColor: isDark ? '#1f2937' : '#fff',
					paddingBottom: Platform.OS === 'ios' ? 20 : 12
				}}
			>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#374151' : '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4 }}>
					<TextInput
						value={input}
						onChangeText={setInput}
						placeholder="Type a message..."
						placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
						style={{ flex: 1, paddingVertical: 10, color: isDark ? '#fff' : '#111827', fontSize: 15 }}
						multiline
						maxLength={500}
					/>
				</View>
				<TouchableOpacity
					onPress={sendMessage}
					disabled={!input.trim()}
					style={{
						backgroundColor: input.trim() ? '#06B6D4' : (isDark ? '#4b5563' : '#e5e7eb'),
						width: 44,
						height: 44,
						borderRadius: 22,
						marginLeft: 12,
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Text style={{ fontSize: 20 }}>➤</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}