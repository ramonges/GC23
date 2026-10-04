import type { Metadata } from 'next'
import RobotExplorer from '@/components/robots/RobotExplorer'

export const metadata: Metadata = {
  title: 'Robot Commodity Explorer — Vulcan Trade',
  description: 'Pick a commercial robot and see, part by part, which commodities it is made of and where they most likely come from. All values are estimates.',
}

export default function RobotsPage() {
  return <RobotExplorer />
}
