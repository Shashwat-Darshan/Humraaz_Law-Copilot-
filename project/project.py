import streamlit as st
import sqlite3
import pandas as pd
import plotly.express as px
import plotly.figure_factory as ff
import random
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
import numpy as np

# --- Database Functions ---

def create_database():
    """Create SQLite database and students table with enhanced schema."""
    conn = sqlite3.connect('student_performance.db')
    cursor = conn.cursor()
    # Drop existing table to ensure schema updates (optional: can be controlled)
    cursor.execute("DROP TABLE IF EXISTS students")
    cursor.execute('''
        CREATE TABLE students (
            student_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            grade REAL,
            attendance REAL,
            study_hours INTEGER,
            extracurricular INTEGER,  -- Hours spent on extracurricular activities
            prev_grade REAL,         -- Previous grade
            is_sample INTEGER DEFAULT 1,  -- 1 for sample data, 0 for user-entered
            last_updated TIMESTAMP
        )
    ''')
    conn.commit()
    return conn, cursor

def generate_sample_data(n_students=20):
    """Generate sample student data with additional attributes."""
    names = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'James', 'Emily', 'Robert', 'Sophie',
             'William', 'Olivia', 'Thomas', 'Ava', 'Joseph', 'Mia', 'Charles', 'Amelia', 'Henry', 'Isabella']
    data = []
    for i in range(1, n_students + 1):
        student = {
            'name': f"{random.choice(names)} {chr(65 + i % 26)}",
            'age': random.randint(15, 18),
            'grade': round(random.uniform(60, 100), 1),
            'attendance': round(random.uniform(70, 100), 1),
            'study_hours': random.randint(5, 20),
            'extracurricular': random.randint(0, 10),
            'prev_grade': round(random.uniform(50, 100), 1),
            'is_sample': 1,
            'last_updated': datetime.now()
        }
        data.append(student)
    return data

def insert_data(conn, cursor, data):
    """Insert data into the students table and increment data_version."""
    cursor.executemany('''
        INSERT INTO students 
        (name, age, grade, attendance, study_hours, extracurricular, prev_grade, is_sample, last_updated)
        VALUES (:name, :age, :grade, :attendance, :study_hours, :extracurricular, :prev_grade, :is_sample, :last_updated)
    ''', data)
    conn.commit()
    if 'data_version' in st.session_state:
        st.session_state.data_version += 1

def initialize_database(conn, cursor):
    """Initialize database with sample data."""
    initial_data = generate_sample_data(20)
    insert_data(conn, cursor, initial_data)
    st.success("Initialized database with 20 sample student records!")

@st.cache_data
def get_data(_conn, is_sample, data_version):
    """Retrieve data from the database with caching, bypassing hash for _conn."""
    df = pd.read_sql_query(f"SELECT * FROM students WHERE is_sample = {is_sample}", _conn)
    return df

# --- Prediction Function ---

def predict_grade(study_hours, attendance, extracurricular, prev_grade, df):
    """Predict grade using Random Forest Regressor and return feature importances."""
    X = df[['study_hours', 'attendance', 'extracurricular', 'prev_grade']]
    y = df['grade']
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    pred_df = pd.DataFrame([[study_hours, attendance, extracurricular, prev_grade]], 
                          columns=['study_hours', 'attendance', 'extracurricular', 'prev_grade'])
    prediction = model.predict(pred_df)[0]
    importance = dict(zip(X.columns, model.feature_importances_))
    return max(60, min(100, prediction)), importance

# --- Streamlit Dashboard ---

def main():
    """Main function to run the Streamlit dashboard."""
    # Initialize session state for data versioning
    if 'data_version' not in st.session_state:
        st.session_state.data_version = 0
    
    st.set_page_config(page_title="Student Performance Dashboard", layout="wide")
    
    # Initialize database
    conn, cursor = create_database()
    initialize_database(conn, cursor)
    
    # Tabs for navigation
    tab1, tab2, tab3 = st.tabs(["Dashboard", "Add Student", "Prediction"])
    
    # Load sample data for training and visualizations
    sample_df = get_data(conn, 1, st.session_state.data_version)
    
    # --- Dashboard Tab ---
    with tab1:
        st.title("Student Performance Dashboard")
        st.markdown("Explore and analyze student academic performance.")
        
        # Button to refresh sample data
        if st.button("Generate Fresh Sample Data"):
            with st.spinner("Generating new sample data..."):
                cursor.execute("DELETE FROM students WHERE is_sample = 1")
                sample_data = generate_sample_data(20)
                insert_data(conn, cursor, sample_data)
                st.success("Generated fresh sample data successfully!")
            sample_df = get_data(conn, 1, st.session_state.data_version)
        
        # Sidebar Filters
        st.sidebar.header("Filters")
        min_grade = st.sidebar.slider("Minimum Grade", 60, 100, 60)
        age_filter = st.sidebar.multiselect("Age", sorted(sample_df['age'].unique()), default=sorted(sample_df['age'].unique()))
        attendance_filter = st.sidebar.slider("Minimum Attendance %", 70, 100, 70)
        extracurricular_filter = st.sidebar.slider("Minimum Extracurricular Hours", 0, 10, 0) if 'extracurricular' in sample_df.columns else 0
        
        # Apply filters to data with column checks
        filtered_df = sample_df.copy()
        filtered_df = filtered_df[filtered_df['grade'] >= min_grade]
        filtered_df = filtered_df[filtered_df['age'].isin(age_filter)]
        filtered_df = filtered_df[filtered_df['attendance'] >= attendance_filter]
        if 'extracurricular' in filtered_df.columns:
            filtered_df = filtered_df[filtered_df['extracurricular'] >= extracurricular_filter]
        
        # Display Metrics
        st.header("Key Metrics")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Average Grade", f"{filtered_df['grade'].mean():.1f}")
        with col2:
            st.metric("Average Attendance", f"{filtered_df['attendance'].mean():.1f}%")
        with col3:
            st.metric("Average Study Hours", f"{filtered_df['study_hours'].mean():.1f}")
        
        # Visualizations
        st.header("Data Visualizations")
        col1, col2 = st.columns(2)
        with col1:
            fig1 = px.scatter(filtered_df, x="study_hours", y="grade", 
                            color="age", hover_data=['name'],
                            title="Study Hours vs Grade")
            st.plotly_chart(fig1, use_container_width=True)
        with col2:
            avg_grade_by_age = filtered_df.groupby('age')['grade'].mean().reset_index()
            fig2 = px.bar(avg_grade_by_age, x="age", y="grade",
                         title="Average Grade by Age")
            st.plotly_chart(fig2, use_container_width=True)
        
        # Correlation Heatmap (only with available columns)
        st.header("Correlation Heatmap")
        corr_columns = [col for col in ['grade', 'attendance', 'study_hours', 'extracurricular', 'prev_grade'] if col in filtered_df.columns]
        if len(corr_columns) > 1:
            corr_matrix = filtered_df[corr_columns].corr()
            fig_heatmap = ff.create_annotated_heatmap(z=corr_matrix.values, x=corr_matrix.columns.tolist(),
                                                    y=corr_matrix.index.tolist(), annotation_text=corr_matrix.round(2).values,
                                                    colorscale='Viridis')
            st.plotly_chart(fig_heatmap, use_container_width=True)
        
        # Box Plot
        st.header("Grade Distribution by Age")
        fig_box = px.box(filtered_df, x="age", y="grade", title="Grade Distribution by Age")
        st.plotly_chart(fig_box, use_container_width=True)
        
        # Data Table
        st.header("Sample Student Data")
        display_columns = [col for col in ['name', 'age', 'grade', 'attendance', 'study_hours', 'extracurricular', 'prev_grade'] if col in filtered_df.columns]
        st.dataframe(filtered_df[display_columns], use_container_width=True)
        
        # Correlation Insight
        correlation = filtered_df['study_hours'].corr(filtered_df['grade'])
        st.markdown(f"**Correlation between Study Hours and Grades:** {correlation:.3f}")

    # --- Add Student Tab ---
    with tab2:
        st.header("Add New Student Data")
        with st.form("student_form"):
            name = st.text_input("Student Name")
            age = st.number_input("Age", min_value=15, max_value=18, step=1)
            grade = st.number_input("Grade", min_value=60.0, max_value=100.0, step=0.1)
            attendance = st.number_input("Attendance %", min_value=70.0, max_value=100.0, step=0.1)
            study_hours = st.number_input("Study Hours per Week", min_value=5, max_value=20, step=1)
            extracurricular = st.number_input("Extracurricular Hours", min_value=0, max_value=10, step=1)
            prev_grade = st.number_input("Previous Grade", min_value=50.0, max_value=100.0, step=0.1)
            
            submitted = st.form_submit_button("Add Student")
            if submitted:
                new_student = [{
                    'name': name,
                    'age': age,
                    'grade': grade,
                    'attendance': attendance,
                    'study_hours': study_hours,
                    'extracurricular': extracurricular,
                    'prev_grade': prev_grade,
                    'is_sample': 0,
                    'last_updated': datetime.now()
                }]
                insert_data(conn, cursor, new_student)
                st.success(f"Added {name} to the database!")

        # Display user-entered students
        user_df = get_data(conn, 0, st.session_state.data_version)
        if not user_df.empty:
            st.header("User-Entered Students")
            display_columns = [col for col in ['name', 'age', 'grade', 'attendance', 'study_hours', 'extracurricular', 'prev_grade'] if col in user_df.columns]
            st.dataframe(user_df[display_columns], use_container_width=True)

    # --- Prediction Tab ---
    with tab3:
        st.header("Grade Prediction")
        pred_study_hours = st.slider("Study Hours", 5, 20, 10)
        pred_attendance = st.slider("Attendance %", 70, 100, 85)
        pred_extracurricular = st.slider("Extracurricular Hours", 0, 10, 5)
        pred_prev_grade = st.slider("Previous Grade", 50, 100, 75)
        
        if st.button("Predict Grade"):
            pred, importance = predict_grade(pred_study_hours, pred_attendance, pred_extracurricular, pred_prev_grade, sample_df)
            st.write(f"**Predicted Grade:** {pred:.1f}")
            st.write("**Factors Influencing Prediction:**")
            for factor, weight in importance.items():
                st.write(f"- {factor}: {weight:.3f}")
        
        # Top Performers
        st.header("Top 5 Sample Performers")
        display_columns = [col for col in ['name', 'grade', 'study_hours', 'attendance', 'extracurricular', 'prev_grade'] if col in sample_df.columns]
        top_students = sample_df.nlargest(5, 'grade')[display_columns]
        st.table(top_students)

    # --- Sidebar Help Section ---
    st.sidebar.markdown("### Help")
    st.sidebar.info("Use the filters to explore data in the Dashboard tab. Hover over charts for details. Add students in the Add Student tab and predict grades in the Prediction tab.")

    # Close database connection
    conn.close()

if __name__ == "__main__":
    main()