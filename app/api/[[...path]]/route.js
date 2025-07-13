import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import LeaveRequest from '@/models/LeaveRequest';
import { auth } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get user from token
async function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// GET /api/user - Get current user profile
async function handleGetUser(request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const userProfile = await User.findOne({ uid: user.uid });
  
  if (!userProfile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(userProfile);
}

// POST /api/auth/register
async function handleRegister(request) {
  try {
    const { idToken, displayName, department, phoneNumber } = await request.json();
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;
    
    await auth.setCustomUserClaims(uid, { role: 'Employee' });
    
    await dbConnect();
    const user = await User.create({
      uid,
      email,
      displayName,
      role: 'Employee',
      department,
      phoneNumber,
      lastLogin: new Date(),
    });
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

// POST /api/auth/login
async function handleLogin(request) {
  try {
    const { idToken } = await request.json();
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;
    
    await dbConnect();
    await User.findOneAndUpdate(
      { uid },
      { 
        uid, 
        email, 
        lastLogin: new Date() 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

// GET /api/leaves - Get user's leave requests
async function handleGetLeaves(request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const leaves = await LeaveRequest.find({ employeeUid: user.uid }).sort({ createdAt: -1 });
  
  return NextResponse.json(leaves);
}

// POST /api/leaves - Create new leave request
async function handleCreateLeave(request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, startDate, endDate, reason, attachment } = await request.json();
    
    // Calculate days between dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    await dbConnect();
    const userProfile = await User.findOne({ uid: user.uid });
    
    const leaveRequest = await LeaveRequest.create({
      id: uuidv4(),
      employeeUid: user.uid,
      employeeName: userProfile.displayName,
      employeeEmail: user.email,
      type,
      startDate: start,
      endDate: end,
      days,
      reason,
      attachment,
      status: 'pending',
    });
    
    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error('Create leave error:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

// GET /api/leaves/pending - Get pending leaves for approval (Manager/HR only)
async function handleGetPendingLeaves(request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const userProfile = await User.findOne({ uid: user.uid });
  
  if (!userProfile || !['Manager', 'HR'].includes(userProfile.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const pendingLeaves = await LeaveRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
  
  return NextResponse.json(pendingLeaves);
}

// PUT /api/leaves/approve - Approve or reject leave request
async function handleApproveLeave(request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leaveId, action, rejectionReason } = await request.json();
    
    await dbConnect();
    const userProfile = await User.findOne({ uid: user.uid });
    
    if (!userProfile || !['Manager', 'HR'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approvedBy: user.uid,
      approvedAt: new Date(),
    };

    if (action === 'reject' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedLeave = await LeaveRequest.findOneAndUpdate(
      { id: leaveId },
      updateData,
      { new: true }
    );

    // If approved, deduct from user's leave balance
    if (action === 'approve' && updatedLeave) {
      const employee = await User.findOne({ uid: updatedLeave.employeeUid });
      if (employee) {
        const balanceField = `leaveBalance.${updatedLeave.type === 'annual' ? 'annual' : updatedLeave.type === 'sick' ? 'sick' : 'personal'}`;
        await User.findOneAndUpdate(
          { uid: updatedLeave.employeeUid },
          { $inc: { [balanceField]: -updatedLeave.days } }
        );
      }
    }

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error('Approve leave error:', error);
    return NextResponse.json({ error: 'Failed to process leave request' }, { status: 500 });
  }
}

// GET /api/dashboard/stats - Get dashboard statistics
async function handleGetDashboardStats(request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const userProfile = await User.findOne({ uid: user.uid });
  
  // Get user's recent leaves
  const recentLeaves = await LeaveRequest.find({ employeeUid: user.uid })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get pending requests count
  const pendingCount = await LeaveRequest.countDocuments({ 
    employeeUid: user.uid, 
    status: 'pending' 
  });

  const stats = {
    leaveBalance: userProfile.leaveBalance,
    recentLeaves,
    pendingCount,
  };

  // Add manager stats if applicable
  if (['Manager', 'HR'].includes(userProfile.role)) {
    const pendingApprovals = await LeaveRequest.countDocuments({ status: 'pending' });
    stats.pendingApprovals = pendingApprovals;
  }

  return NextResponse.json(stats);
}

export async function GET(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');

  try {
    switch (path) {
      case '/user':
        return handleGetUser(request);
      case '/leaves':
        return handleGetLeaves(request);
      case '/leaves/pending':
        return handleGetPendingLeaves(request);
      case '/dashboard/stats':
        return handleGetDashboardStats(request);
      default:
        return NextResponse.json({ message: 'Breakly API - Ready!' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');

  try {
    switch (path) {
      case '/auth/register':
        return handleRegister(request);
      case '/auth/login':
        return handleLogin(request);
      case '/leaves':
        return handleCreateLeave(request);
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');

  try {
    switch (path) {
      case '/leaves/approve':
        return handleApproveLeave(request);
      default:
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}