import express, { Request, Response } from 'express';
import cors from 'cors';


// NOTE: you may modify these interfaces
interface Student {
  id: number;
  name: string;
}

interface GroupSummary {
  id: number;
  groupName: string;
  members: number[];
}

interface Group {
  id: number;
  groupName: string;
  members: Student[];
}

class Groups {
  // Local storage
  groups: Group[];
  // Used to generate IDs
  groupIdTracker: number;
  studentIdTracker: number;

  constructor() {
    this.groups = [];
    this.groupIdTracker = 0;
    this.studentIdTracker = 0;
  }

  // Find a group by ID
  getGroup(id: number): Group | undefined {
    return this.groups.find(group => group.id == id);
  }

  // Collate all group summaries
  getAllGroupSummaries(): GroupSummary[] {
    return this.groups.map(this.createGroupSummary);
  }

  // Create a group summary based on ID
  createGroupSummary(group: Group): GroupSummary {
    return {
      id: group.id,
      groupName: group.groupName,
      members: group.members.map(student => student.id)
    };
  }

  // Create a new group
  createGroup(groupName: string, members: string[]): GroupSummary {
    const newGroup: Group = {
      id: this.groupIdTracker++,
      groupName: groupName,
      members: members.map(this.createStudent, this)
    };
    this.groups.push(newGroup);

    return this.createGroupSummary(newGroup);
  }

  // Create a new student
  createStudent(name: string): Student {
    return {
      id: this.studentIdTracker++,
      name: name
    };
  }

  // Get all students
  getAllStudents(): Student[] {
    return this.groups.flatMap(group => group.members);
  }

  deleteGroup(id: number): boolean {
    const index = this.groups.findIndex(group => group.id == id);
    if (index >= 0) {
      this.groups.splice(index, 1);
      return true;
    }
    return false;
  }
}

const app = express();
const port = 3902;

app.use(cors());
app.use(express.json());

const groups = new Groups();

/**
 * Route to get all groups
 * @route GET /api/groups
 * @returns {Array} - Array of group objects
 */
app.get('/api/groups', (req: Request, res: Response) => {
  // TODO: (sample response below)
  res.json(groups.getAllGroupSummaries());
});

/**
 * Route to get all students
 * @route GET /api/students
 * @returns {Array} - Array of student objects
 */
app.get('/api/students', (req: Request, res: Response) => {
  // TODO: (sample response below)
  res.json(groups.getAllStudents());
});

/**
 * Route to add a new group
 * @route POST /api/groups
 * @param {string} req.body.groupName - The name of the group
 * @param {Array} req.body.members - Array of member names
 * @returns {Object} - The created group object
 */
app.post('/api/groups', (req: Request, res: Response) => {
  // TODO: implement storage of a new group and return their info (sample response below)
  const { groupName, members } = req.body;

  // Edge case: groups must contain at least one member
  if (members[0] == '') {
    res.status(400).send("Groups must contain members");
    return;
  }

  res.json(groups.createGroup(groupName, members));
});

/**
 * Route to delete a group by ID
 * @route DELETE /api/groups/:id
 * @param {number} req.params.id - The ID of the group to delete
 * @returns {void} - Empty response with status code 204
 */
app.delete('/api/groups/:id', (req: Request, res: Response) => {
  // TODO: (delete the group with the specified id)
  const id = parseInt(req.params.id);

  const group = groups.getGroup(id)

  if (!group) {
    res.status(404).send(`Group not found with ID: ${id}`);
    return;
  }

  groups.deleteGroup(id);

  res.sendStatus(204); // send back a 204 (do not modify this line)
});

/**
 * Route to get a group by ID (for fetching group members)
 * @route GET /api/groups/:id
 * @param {number} req.params.id - The ID of the group to retrieve
 * @returns {Object} - The group object with member details
 */
app.get('/api/groups/:id', (req: Request, res: Response) => {
  // TODO: (sample response below)
  const id = parseInt(req.params.id);

  const group = groups.getGroup(id)

  // Edge case: cannot delete an invalid ID
  if (!group) {
    res.status(404).send(`Group not found with ID: ${id}`);
    return;
  }

  res.json(group);

  /* TODO:
   * if (group id isn't valid) {
   *   res.status(404).send("Group not found");
   * }
   */
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
