import * as Yup from 'yup';
import { Op } from 'sequelize';

import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async detail(req, res) {
    const { id } = req.params;
    if (!Number(id)) {
      return res.status(400).json({ error: 'Id invalid' });
    }

    const meetup = await Meetup.findByPk(id);
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }
    return res.json(meetup);
  }

  async index(req, res) {
    const where = {};
    const { page = 1, date } = req.query;

    if (date) {
      const dateParsed = parseISO(date);

      where.date = {
        [Op.between]: [startOfDay(dateParsed), endOfDay(dateParsed)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'image',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    return res.json(meetups);
  }

  async store(req, res) {
    const user_id = req.userId;

    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Meetup with last date is not allowed' });
    }

    const meetup = await Meetup.create({ ...req.body, user_id });

    return res.json(meetup);
  }

  async update(req, res) {
    const user_id = req.userId;

    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    if (!Number(id)) {
      return res.status(400).json({ error: 'Id invalid' });
    }

    const meetup = await Meetup.findByPk(id);
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'Can not update past meetups' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Meetup with last date is not allowed' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const user_id = req.userId;

    const { id } = req.params;
    if (!Number(id)) {
      return res.status(400).json({ error: 'Id invalid' });
    }

    const meetup = await Meetup.findByPk(id);
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'Can not delete past meetups' });
    }

    await meetup.destroy();

    return res.json({ success: 'Meetup deleted with success' });
  }
}

export default new MeetupController();
