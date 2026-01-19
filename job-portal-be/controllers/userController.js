import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'
import dotenv from 'dotenv'
dotenv.config()

const signToken = payload => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })

export const registerUser = async (req, res, next) => {
  try {
    let { user_email, password } = req.body
    if (user_email) user_email = user_email.trim()
    if (password) password = password.trim()
    if (!user_email || !password) return res.status(400).json({ success: false, message: 'user_email and password required' })

    const [existing] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [user_email])
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'User already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const [loginResult] = await db.execute('INSERT INTO user_login (user_email, password) VALUES (?, ?)', [user_email, hashed])
    const userId = loginResult.insertId

    await db.execute('INSERT INTO user_details (user_id, details_completed) VALUES (?, 0)', [userId])
    await db.execute('INSERT INTO freelancer_details (user_id) VALUES (?)', [userId])

    const token = signToken({ user_email, id: userId })
    const [ud] = await db.execute('SELECT name, age, role, companyName, location, companies, user_id AS company_id, details_completed FROM user_details WHERE user_id = ?', [userId])
    const [fd] = await db.execute('SELECT name, skills_json AS skills, experience FROM freelancer_details WHERE user_id = ?', [userId])
    const userDetails = { ...(ud[0] || {}), ...(fd[0] || {}) }

    if (userDetails.companies) {
      try { userDetails.companies = JSON.parse(userDetails.companies) } catch { userDetails.companies = [] }
    } else userDetails.companies = []

    if (userDetails.skills) {
      try { userDetails.skillsList = JSON.parse(userDetails.skills) } catch { userDetails.skillsList = [] }
      delete userDetails.skills
    } else userDetails.skillsList = []

    userDetails.detailsCompleted = userDetails.details_completed === 1
    delete userDetails.details_completed

    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      token, 
      user_email, 
      userDetails,
      isNewUser: true,
      role: null
    })
  } catch (err) {
    next(err)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    let { user_email, password } = req.body
    if (user_email) user_email = user_email.trim()
    if (password) password = password.trim()
    if (!user_email || !password) return res.status(400).json({ success: false, message: 'user_email and password required' })

    const [rows] = await db.execute('SELECT * FROM user_login WHERE user_email = ?', [user_email])
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not registered' })

    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ success: false, message: 'Incorrect password' })

    const [ud] = await db.execute('SELECT name, age, role, companyName, location, companies, user_id AS company_id, details_completed FROM user_details WHERE user_id = ?', [user.id])
    const [fd] = await db.execute('SELECT name, skills_json AS skills, experience FROM freelancer_details WHERE user_id = ?', [user.id])
    const userDetails = { ...(ud[0] || {}), ...(fd[0] || {}) }

    if (!userDetails.role) {
      userDetails.role = userDetails.companyName ? 'company' : 'freelancer'
    }

    if (userDetails.companies) {
      try { userDetails.companies = JSON.parse(userDetails.companies) } catch { userDetails.companies = [] }
    } else userDetails.companies = []

    if (userDetails.skills) {
      try { userDetails.skillsList = JSON.parse(userDetails.skills) } catch { userDetails.skillsList = [] }
      delete userDetails.skills
    } else userDetails.skillsList = []

    const isNewUser = userDetails.details_completed === 0
    const role = userDetails.role

    userDetails.detailsCompleted = userDetails.details_completed === 1
    delete userDetails.details_completed

    const token = signToken({ user_email, id: user.id })
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      user_email, 
      userDetails,
      isNewUser,
      role
    })
  } catch (err) {
    next(err)
  }
}

export const getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params
    if (!email) return res.status(400).json({ success: false, message: 'Email required' })

    const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [email])
    if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

    const userId = userRows[0].id
    const [ud] = await db.execute('SELECT name, age, role, companyName, location, companies, user_id AS company_id, details_completed FROM user_details WHERE user_id = ?', [userId])
    const [fd] = await db.execute('SELECT name, skills_json AS skills, experience FROM freelancer_details WHERE user_id = ?', [userId])
    const userDetails = { ...(ud[0] || {}), ...(fd[0] || {}) }

    if (!userDetails.role) {
      userDetails.role = userDetails.companyName ? 'company' : 'freelancer'
    }

    if (userDetails.companies) {
      try { userDetails.companies = JSON.parse(userDetails.companies) } catch { userDetails.companies = [] }
    } else userDetails.companies = []

    if (userDetails.skills) {
      try { userDetails.skillsList = JSON.parse(userDetails.skills) } catch { userDetails.skillsList = [] }
      delete userDetails.skills
    } else userDetails.skillsList = []

    userDetails.detailsCompleted = userDetails.details_completed === 1
    delete userDetails.details_completed

    return res.status(200).json(userDetails)
  } catch (err) {
    next(err)
  }
}

export const updateUserDetails = async (req, res, next) => {
  try {
    let { user_email, name, age, role, companyName, location, skillsList, companies } = req.body
    if (!user_email) return res.status(400).json({ success: false, message: 'user_email required' })

    const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [user_email])
    if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

    const userId = userRows[0].id
    companyName = companyName || null
    location = location || null

    if (typeof skillsList === 'string' && !skillsList.trim()) skillsList = []
    if (typeof companies === 'string' && !companies.trim()) companies = []
    skillsList = Array.isArray(skillsList) ? skillsList : []
    companies = Array.isArray(companies) ? companies : []

    if (!role) {
      const [existingRole] = await db.execute('SELECT role FROM user_details WHERE user_id = ?', [userId])
      role = existingRole[0]?.role || null
    }

    const [exists] = await db.execute('SELECT id FROM user_details WHERE user_id = ?', [userId])
    if (exists.length === 0) {
      await db.execute('INSERT INTO user_details (user_id, name, age, role, companyName, location, companies, details_completed) VALUES (?, ?, ?, ?, ?, ?, ?, 1)', [userId, name, age, role, companyName, location, JSON.stringify(companies)])
    } else {
      await db.execute('UPDATE user_details SET name = ?, age = ?, role = ?, companyName = ?, location = ?, companies = ?, details_completed = 1 WHERE user_id = ?', [name, age, role, companyName, location, JSON.stringify(companies), userId])
    }

    if (role === 'freelancer') {
      const [existsF] = await db.execute('SELECT id FROM freelancer_details WHERE user_id = ?', [userId])
      if (existsF.length === 0) {
        await db.execute('INSERT INTO freelancer_details (user_id, name, skills_json) VALUES (?, ?, ?)', [userId, name, JSON.stringify(skillsList)])
      } else {
        await db.execute('UPDATE freelancer_details SET name = ?, skills_json = ? WHERE user_id = ?', [name, JSON.stringify(skillsList), userId])
      }
    }

    const [ud] = await db.execute('SELECT name, age, role, companyName, location, companies, details_completed FROM user_details WHERE user_id = ?', [userId])
    const [fd] = await db.execute('SELECT skills_json AS skills FROM freelancer_details WHERE user_id = ?', [userId])
    const userDetails = { ...(ud[0] || {}), ...(fd[0] || {}) }

    userDetails.detailsCompleted = userDetails.details_completed === 1
    delete userDetails.details_completed

    if (userDetails.companies) {
      try { userDetails.companies = JSON.parse(userDetails.companies) } catch { userDetails.companies = [] }
    } else userDetails.companies = []

    if (userDetails.skills) {
      try { userDetails.skillsList = JSON.parse(userDetails.skills) } catch { userDetails.skillsList = [] }
      delete userDetails.skills
    } else userDetails.skillsList = []

    return res.status(200).json({ success: true, message: 'User details updated', userDetails })
  } catch (err) {
    next(err)
  }
}

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id; // extracted from token by protect middleware
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const [loginRows] = await db.execute('SELECT user_email FROM user_login WHERE id = ?', [userId]);
    if (!loginRows.length) return res.status(404).json({ success: false, message: 'User not found' });

    const user_email = loginRows[0].user_email;

    const [ud] = await db.execute(
      'SELECT name, age, role, companyName, location, companies, details_completed FROM user_details WHERE user_id = ?',
      [userId]
    );
    const [fd] = await db.execute(
      'SELECT name AS freelancerName, skills_json AS skills, experience FROM freelancer_details WHERE user_id = ?',
      [userId]
    );

    const userDetails = { ...(ud[0] || {}), ...(fd[0] || {}) };
    try { userDetails.companies = JSON.parse(userDetails.companies || '[]'); } catch { userDetails.companies = []; }
    try { userDetails.skillsList = JSON.parse(userDetails.skills || '[]'); } catch { userDetails.skillsList = []; }
    delete userDetails.skills;

    userDetails.detailsCompleted = userDetails.details_completed === 1;
    delete userDetails.details_completed;

    return res.status(200).json({
      success: true,
      user_email,
      userDetails,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteUserDetails = async (req, res, next) => {
  try {
    const { user_email } = req.body
    if (!user_email) return res.status(400).json({ success: false, message: 'user_email required' })

    const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [user_email])
    if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

    const userId = userRows[0].id
    await db.execute('UPDATE user_details SET name = NULL, age = NULL, role = NULL, companyName = NULL, location = NULL, companies = NULL, details_completed = 0 WHERE user_id = ?', [userId])
    await db.execute('UPDATE freelancer_details SET name = NULL, skills_json = NULL, experience = NULL WHERE user_id = ?', [userId])
    return res.status(200).json({ success: true, message: 'User details deleted' })
  } catch (err) {
    next(err)
  }
}
