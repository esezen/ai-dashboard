import { Input } from '@/components/ui/input'

export default function Home() {
  return (
      <div className="bg-slate-900 flex flex-col items-center justify-between flex-grow w-full h-full">
        <div className="h-16 w-full grid items-center">
          <h1 className="text-center">Chat</h1>
        </div>
        <div className="w-full flex-grow flex flex-col-reverse p-10">
          <div className="mx-auto w-2/4">
            <Input placeholder="Your question" className="w-full"/>
          </div>
        </div>
      </div>
  )
}
