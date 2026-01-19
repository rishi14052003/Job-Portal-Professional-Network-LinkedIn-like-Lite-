import db from '../config/db.js'

export const createJob = async (req, res, next) => {
  try {
    const { user_email, title, description, location } = req.body;
    if (!user_email || !title || !description)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [user_email]);
    if (!userRows || userRows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found' });

    const userId = userRows[0].id;
    const [detailRows] = await db.execute('SELECT user_id FROM user_details WHERE user_id = ?', [userId]);
    if (detailRows.length === 0)
      await db.execute('INSERT INTO user_details (user_id) VALUES (?)', [userId]);

    await db.execute(
      'INSERT INTO job_posts (company_id, title, description, location) VALUES (?, ?, ?, ?)',
      [userId, title, description, location || null]
    );

    return res.status(201).json({ success: true, message: 'Job posted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const [totalRows] = await db.execute('SELECT COUNT(id) AS count FROM job_posts');
    const totalJobs = totalRows[0].count;
    const totalPages = Math.ceil(totalJobs / limit);

    const query = `
      SELECT jp.id, jp.title, jp.description, jp.location, jp.company_id, ud.companyName AS companyName
      FROM job_posts jp
      LEFT JOIN user_details ud ON jp.company_id = ud.user_id
      ORDER BY jp.id DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const [jobs] = await db.query(query); 

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalJobs,
      limit,
      jobs,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const applyToJob = async (req, res, next) => {
    try {
        const { user_email, job_id } = req.body
        if (!user_email || !job_id) return res.status(400).json({ success: false, message: 'Missing fields' })

        const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [user_email])
        if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

        const applicantId = userRows[0].id
        const [exists] = await db.execute('SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?', [job_id, applicantId])
        if (exists.length) return res.status(400).json({ success: false, message: 'Already applied' })

        await db.execute('INSERT INTO job_applications (job_id, applicant_id, status) VALUES (?, ?, ?)', [job_id, applicantId, 'pending'])
        return res.status(201).json({ success: true, message: 'Applied successfully' })
    } catch (err) {
        next(err)
    }
}

export const withdrawApplication = async (req, res, next) => {
    try {
        const { user_email, job_id } = req.body
        if (!user_email || !job_id) return res.status(400).json({ success: false, message: 'Missing fields' })

        const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [user_email])
        if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

        const applicantId = userRows[0].id
        const [existing] = await db.execute('SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?', [job_id, applicantId])
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Application not found' })

        await db.execute('DELETE FROM job_applications WHERE job_id = ? AND applicant_id = ?', [job_id, applicantId])
        return res.status(200).json({ success: true, message: 'Application withdrawn successfully' })
    } catch (err) {
        next(err)
    }
}

export const getApplicantsByJob = async (req, res, next) => {
    try {
        const { jobId } = req.params
        const [applicants] = await db.execute(
            `SELECT ja.id AS applicationId, ja.status, u.user_email, fd.name, fd.skills_json AS skills, fd.experience
            FROM job_applications ja
            JOIN user_login u ON ja.applicant_id = u.id
            LEFT JOIN freelancer_details fd ON u.id = fd.user_id
            WHERE ja.job_id = ?`,
            [jobId]
        )
        return res.status(200).json(applicants)
    } catch (err) {
        next(err)
    }
}

export const respondToApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params
        const { action } = req.body
        if (!['accept', 'reject'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' })

        const [result] = await db.execute('UPDATE job_applications SET status = ? WHERE id = ?', [action, applicationId])
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Application not found' })

        return res.status(200).json({ success: true, message: `Application ${action}ed successfully` })
    } catch (err) {
        next(err)
    }
}

export const updateJob = async (req, res, next) => {
    try {
        const { jobId } = req.params
        const { title, description, location } = req.body
        const [existing] = await db.execute('SELECT * FROM job_posts WHERE id = ?', [jobId])
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Job not found' })

        await db.execute('UPDATE job_posts SET title = ?, description = ?, location = ? WHERE id = ?', [title, description, location, jobId])
        return res.status(200).json({ success: true, message: 'Job updated successfully' })
    } catch (err) {
        next(err)
    }
}

export const deleteJob = async (req, res, next) => {
    try {
        const { jobId } = req.params
        const [existing] = await db.execute('SELECT * FROM job_posts WHERE id = ?', [jobId])
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Job not found' }) 
        await db.execute('DELETE FROM job_applications WHERE job_id = ?', [jobId])
        await db.execute('DELETE FROM job_posts WHERE id = ?', [jobId])
        return res.status(200).json({ success: true, message: 'Job deleted successfully' })
    } catch (err) {
        next(err)
    }
}

export const getApplicationsByFreelancer = async (req, res, next) => {
    try {
        const { user_email } = req.params
        const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [user_email])
        if (userRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

        const userId = userRows[0].id
        const [applications] = await db.execute(
            `SELECT ja.id AS applicationId, ja.status, ja.job_id, jp.title, jp.description, ud.companyName, jp.location
            FROM job_applications ja
            JOIN job_posts jp ON ja.job_id = jp.id
            LEFT JOIN user_details ud ON jp.company_id = ud.user_id
            WHERE ja.applicant_id = ?
            ORDER BY ja.id DESC`,
            [userId]
        )
        return res.status(200).json({ success: true, applications })
    } catch (err) {
        next(err)
    }
}

