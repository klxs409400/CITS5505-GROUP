"""initial database schema

Revision ID: a1b2c3d4e5f6
Revises: 
Create Date: 2025-05-15 13:19:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create user table
    op.create_table('user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=64), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=128), nullable=True),
        sa.Column('full_name', sa.String(length=120), nullable=True),
        sa.Column('date_joined', sa.DateTime(), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('location', sa.String(length=120), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('profile_pic', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    
    # Create sleep_record table
    op.create_table('sleep_record',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('bedtime', sa.DateTime(), nullable=False),
        sa.Column('wake_time', sa.DateTime(), nullable=False),
        sa.Column('duration_hours', sa.Float(), nullable=False),
        sa.Column('quality', sa.String(length=20), nullable=True),
        sa.Column('mood', sa.String(length=20), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('sleep_disturbances', sa.String(length=20), nullable=True),
        sa.Column('sleep_aid', sa.String(length=20), nullable=True),
        sa.Column('daytime_dysfunction', sa.String(length=20), nullable=True),
        sa.Column('caffeine', sa.Integer(), nullable=True),
        sa.Column('exercise', sa.Integer(), nullable=True),
        sa.Column('screen', sa.Integer(), nullable=True),
        sa.Column('eating', sa.Integer(), nullable=True),
        sa.Column('sleep_latency', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'date', name='unique_user_date')
    )
    
    # Create sleep_goal table
    op.create_table('sleep_goal',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('target_hours', sa.Integer(), nullable=True),
        sa.Column('target_minutes', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create achievement table
    op.create_table('achievement',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=64), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('icon', sa.String(length=64), nullable=True),
        sa.Column('achieved_at', sa.DateTime(), nullable=True),
        sa.Column('is_locked', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create data_sharing table
    op.create_table('data_sharing',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('viewer_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['viewer_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('owner_id', 'viewer_id', name='unique_sharing')
    )


def downgrade():
    # Drop tables in reverse order of creation
    op.drop_table('data_sharing')
    op.drop_table('achievement')
    op.drop_table('sleep_goal')
    op.drop_table('sleep_record')
    op.drop_table('user')