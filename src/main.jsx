import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/sidebar';
import { ChatMessages } from './components/chatMessages';
import { ChatInput } from './components/chatInput';
import { redditApis } from './utils/constant';
import axios from 'axios'



function App() {
  const [chats, setChats] = useState([]);
  const [tokenValidated, setTokenValidated] = useState(0);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const auhenticateUser = async () => {
    try {
      const authUrl =
        `https://www.reddit.com/api/v1/authorize?` +
        `client_id=${process.env.REACT_APP_REDDIT_CLIENT_ID}&response_type=code&state=${process.env.REACT_APP_REDDIT_STATE}&` +
        `redirect_uri=${process.env.REACT_APP_REDDIT_REDIRECT_URI}&scope=${process.env.REACT_APP_REDDIT_SCOPE}`;
      console.log(authUrl);
      window.open(authUrl, "_blank");
    } catch (error) {
      console.error('Error in getting auth url: ', error);
      throw error;
    }
  };

  const waitForAuthCode = async () => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 6; // Timeout after ~1 minutes
      let attempts = 0;

      const interval = setInterval(async () => {
        try {
          // Fetch AuthCode status in redis
          let checkTokenConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: redditApis.TOKEN_VALIDATION,
            headers: {
              'Content-Type': 'application/json'
            }
          };
          const response = await axios.request(checkTokenConfig);
          console.log('attempt Number: ', attempts)
          if (response.data.data.auth_code) {
            clearInterval(interval);
            return resolve(true);
          }
          attempts++;
          console.log(`Waiting for auth code... Attempt ${attempts}/${maxAttempts}`);

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error("Timeout waiting for Reddit authorization code"));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 10000); // Check every 10 seconds
    });
  }

  const getAccessToken = async () => {
    try {
      let accessTokenConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: redditApis.ACCESS_TOKEN_API,
        headers: {}
      };
      await axios.request(accessTokenConfig)
    } catch (error) {
      console.error("Error fetching access token:", error.message);
      throw error;
    }
  };

  const getUsername = async () => {
    try {
      let usernameConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: redditApis.VALIDATE_ACCESS_TOKEN_API,
        headers: {}
      };
      await axios.request(usernameConfig)
    } catch (error) {
      console.error("Error fetching username:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      messages: [],
      title: 'New Chat'
    };
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setInput('');
  };

  const deleteChat = (chatId) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokenValidated) {
      alert('Error in setting required accesses, please restart the tab');
      return;
    }
    if (!input.trim()) return;

    let activeChatId = currentChatId;
    let updatedChats = chats;

    // If no chat exists or none is selected, create one
    if (!activeChatId) {
      const newChat = {
        id: Date.now().toString(),
        messages: [],
        title: 'New Chat'
      };
      updatedChats = [...chats, newChat];
      activeChatId = newChat.id;
      setChats(updatedChats);
      setCurrentChatId(activeChatId);
    }

    const newMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
    };

    updatedChats = updatedChats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          title: chat.messages.length === 0 ? input.substring(0, 30) : chat.title
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setInput('');

    try {
      const response = await axios.post(redditApis.PROCESS_USER_PROMPT, {
        prompt: input
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(response.data.data);

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: response.data.data,
        isUser: false,
      };

      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, aiResponse]
          };
        }
        return chat;
      }));
    } catch (error) {

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, something went wrong. Please try again later.",
        isUser: false,
      };

      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, errorMessage]
          };
        }
        return chat;
      }));
    }
  };

  const authenticate = async (e) => {
    try {
      e.preventDefault();
      let checkTokenConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: redditApis.TOKEN_VALIDATION,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await axios.request(checkTokenConfig);
      console.log(response.data.data)
      if (!response.data.data.auth_code) {
        await auhenticateUser();
        console.log(new Date().toISOString());
        await waitForAuthCode();
        console.log(new Date().toISOString());
        await getAccessToken();
        console.log(new Date().toISOString());
        await getUsername()
        console.log(new Date().toISOString());
        setTokenValidated(1);
        return;
      } if (!response.data.data.access_token) {
        await getAccessToken();
      } if (!response.data.data.user_name) {
        await getUsername();
      }
      setTokenValidated(1);
      return;
    } catch (error) {
      console.error("Error fetching  token:", error.message);
      setTokenValidated(0);
      alert('Not able to get required access')
    }
  };


  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''}`}>

      {/* Main app layout */}
      <div className="flex flex-1">
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          onCreateNewChat={createNewChat}
          onDeleteChat={deleteChat}
          onSelectChat={setCurrentChatId}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col h-screen relative bg-gray-100 dark:bg-gray-800">
          <button
            className="md:hidden absolute left-4 top-4 z-10 dark:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className=" p-4 flex justify-center items-center bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
        <button
          onClick={authenticate}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          disabled={tokenValidated === 1}
        >
          {tokenValidated === 1 ? 'Authenticated your Reddit App' : 'Authenticate your Reddit App'}
        </button>
      </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <ChatMessages currentChat={currentChat} />
          </div>

          <ChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            disabled={!input.trim()}
          />
        </div>
      </div>
    </div>
  );
}

export default App;