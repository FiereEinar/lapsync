import { Request, Response } from 'express';
import { RaceCheckpointModel } from '../models/race-checkpoint.model';

export const createCheckpoint = async (req: Request, res: Response) => {
  try {
    const { event, raceCategory, name, type, location, order } = req.body;
    
    if (!event || !raceCategory || !name || !location || location.lat === undefined || location.lng === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const checkpoint = new RaceCheckpointModel({ event, raceCategory, name, type, location, order });
    await checkpoint.save();
    
    res.status(201).json({ success: true, data: checkpoint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCheckpointsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { raceCategory } = req.query;
    
    const query: any = { event: eventId };
    if (raceCategory) {
      query.raceCategory = raceCategory;
    }
    
    const checkpoints = await RaceCheckpointModel.find(query).sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, data: checkpoints });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCheckpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const checkpoint = await RaceCheckpointModel.findByIdAndUpdate(id, updates, { new: true });
    
    if (!checkpoint) {
      return res.status(404).json({ success: false, message: 'Checkpoint not found' });
    }
    
    res.status(200).json({ success: true, data: checkpoint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCheckpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const checkpoint = await RaceCheckpointModel.findByIdAndDelete(id);
    
    if (!checkpoint) {
      return res.status(404).json({ success: false, message: 'Checkpoint not found' });
    }
    
    res.status(200).json({ success: true, message: 'Checkpoint deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
