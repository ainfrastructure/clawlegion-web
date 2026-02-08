import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// GET: Get git commit stats by author
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since') || '24 hours ago'
  const author = searchParams.get('author')
  
  try {
    // Get commit counts by author
    let cmd = `cd ${process.cwd()} && git log --since="${since}" --format="%an" | sort | uniq -c | sort -rn`
    
    const { stdout } = await execAsync(cmd, { timeout: 5000 })
    
    const commits = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/)
        if (match) {
          return { author: match[2], commits: parseInt(match[1]) }
        }
        return null
      })
      .filter(Boolean)
    
    // Get total commits
    const total = commits.reduce((sum, c) => sum + (c?.commits || 0), 0)
    
    // Get specific author if requested
    if (author) {
      const authorCommits = commits.find(c => 
        c?.author.toLowerCase().includes(author.toLowerCase())
      )
      return NextResponse.json({
        author,
        commits: authorCommits?.commits || 0,
        since
      })
    }
    
    return NextResponse.json({
      since,
      total,
      byAuthor: commits
    })
  } catch (err: any) {
    return NextResponse.json({
      error: 'Failed to get git stats',
      message: err.message
    }, { status: 500 })
  }
}
