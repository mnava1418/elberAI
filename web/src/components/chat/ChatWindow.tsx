import MessageList from './MessageList'
import InputToolBar from './InputToolBar'

export default function ChatWindow() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MessageList />
      <InputToolBar />
    </div>
  )
}
