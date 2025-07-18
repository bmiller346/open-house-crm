import type { Pipeline as PipelineType } from './types';
import { AppDataSource } from '../../data-source';
import { Pipeline as PipelineEntity } from '../../entities/Pipeline';

export async function listPipelines(userId: string, workspaceId: string): Promise<PipelineEntity[]> {
  const pipelineRepository = AppDataSource.getRepository(PipelineEntity);
  // Fetch pipelines scoped to the workspace
  return pipelineRepository.find({ where: { workspaceId } });
}
